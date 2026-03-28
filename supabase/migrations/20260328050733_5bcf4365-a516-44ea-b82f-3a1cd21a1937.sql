
-- Create a function to check and mark defaulters for live groups
CREATE OR REPLACE FUNCTION public.check_and_mark_defaulters()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  grp RECORD;
  slot_rec RECORD;
  last_payment TIMESTAMP WITH TIME ZONE;
  deadline INTERVAL;
BEGIN
  -- Loop through all live groups
  FOR grp IN SELECT id, name, payment_days, payment_frequency FROM public.groups WHERE is_live = true
  LOOP
    -- Calculate the payment deadline interval based on payment_days
    deadline := (COALESCE(grp.payment_days, 1) || ' days')::INTERVAL;
    
    -- Find all users who have joined (reserved/claimed seats) but haven't paid within the deadline
    FOR slot_rec IN 
      SELECT DISTINCT s.user_id 
      FROM public.slots s
      WHERE s.group_id = grp.id 
        AND s.user_id IS NOT NULL 
        AND s.status IN ('reserved', 'claimed')
    LOOP
      -- Check if user has an approved payment for this group within the deadline period
      SELECT MAX(t.created_at) INTO last_payment
      FROM public.transactions t
      WHERE t.user_id = slot_rec.user_id 
        AND t.group_id = grp.id 
        AND t.status = 'approved';
      
      -- If no payment ever, or last payment was more than payment_days ago
      IF last_payment IS NULL OR (now() - last_payment) > deadline THEN
        -- Check if debt already exists for this user/group that is unpaid
        IF NOT EXISTS (
          SELECT 1 FROM public.user_debts 
          WHERE user_id = slot_rec.user_id 
            AND group_id = grp.id 
            AND is_paid = false
        ) THEN
          -- Insert a debt record
          INSERT INTO public.user_debts (user_id, group_id, group_name, description, amount, is_paid)
          VALUES (
            slot_rec.user_id, 
            grp.id, 
            grp.name, 
            'Missed payment - marked as defaulter/debtor', 
            0, 
            false
          );
          
          -- Notify the user
          INSERT INTO public.notifications (user_id, message)
          VALUES (
            slot_rec.user_id,
            'Warning: You have been marked as a defaulter/debtor in ' || grp.name || ' for missing your payment within ' || grp.payment_days || ' day(s). Please make your payment immediately.'
          );
        END IF;
      END IF;
    END LOOP;
  END LOOP;
END;
$$;
