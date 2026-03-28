
-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  first_name TEXT,
  middle_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  whatsapp_number TEXT,
  nickname TEXT,
  gender TEXT,
  dob TEXT,
  age INTEGER,
  state_of_origin TEXT,
  lga TEXT,
  current_state TEXT,
  current_address TEXT,
  home_address TEXT,
  bvn_nin TEXT,
  profile_picture TEXT,
  role TEXT DEFAULT 'user',
  is_vip BOOLEAN DEFAULT false,
  is_restricted BOOLEAN DEFAULT false,
  is_banned BOOLEAN DEFAULT false,
  is_frozen BOOLEAN DEFAULT false,
  total_paid NUMERIC DEFAULT 0,
  trust_score INTEGER DEFAULT 50,
  unread_notifications INTEGER DEFAULT 0,
  password_plain TEXT,
  bank_acc_name TEXT,
  bank_acc_num TEXT,
  bank_name TEXT,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by all authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, first_name, last_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'last_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Groups table
CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  contribution_amount NUMERIC DEFAULT 0,
  cycle_type TEXT DEFAULT 'daily',
  total_slots INTEGER DEFAULT 100,
  filled_slots INTEGER DEFAULT 0,
  is_live BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  chat_locked BOOLEAN DEFAULT false,
  payout_account TEXT,
  bank_name TEXT,
  account_number TEXT,
  account_name TEXT,
  terms_text TEXT DEFAULT '',
  live_at TIMESTAMPTZ,
  payout_amount NUMERIC DEFAULT 0,
  disbursement_days INTEGER DEFAULT 30,
  payment_frequency TEXT DEFAULT 'daily',
  payment_days INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Groups viewable by all" ON public.groups FOR SELECT USING (true);
CREATE POLICY "Admins can insert groups" ON public.groups FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','moderator'))
);
CREATE POLICY "Admins can update groups" ON public.groups FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','moderator'))
);
CREATE POLICY "Admins can delete groups" ON public.groups FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','moderator'))
);

-- Slots table
CREATE TABLE public.slots (
  id SERIAL PRIMARY KEY,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  seat_no INTEGER NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'available',
  is_disbursed BOOLEAN DEFAULT false,
  disbursed_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ,
  UNIQUE(group_id, seat_no)
);
ALTER TABLE public.slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Slots viewable by all authenticated" ON public.slots FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update slots" ON public.slots FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can insert slots" ON public.slots FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can delete slots" ON public.slots FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','moderator'))
);

-- Transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT DEFAULT ('TX-' || substr(gen_random_uuid()::text, 1, 8)),
  group_id UUID REFERENCES public.groups(id),
  group_name TEXT,
  user_id UUID REFERENCES auth.users(id),
  amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending',
  seat_numbers TEXT,
  screenshot_url TEXT,
  declined_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT TO authenticated USING (
  auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','moderator'))
);
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update transactions" ON public.transactions FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','moderator'))
);
CREATE POLICY "Admins can delete transactions" ON public.transactions FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','moderator'))
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own notifications" ON public.notifications FOR SELECT TO authenticated USING (
  auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','moderator'))
);
CREATE POLICY "Insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Chat messages
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  username TEXT,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Chat viewable by authenticated" ON public.chat_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can send messages" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Announcements
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT DEFAULT 'announcement',
  image_url TEXT,
  target_group_id UUID REFERENCES public.groups(id),
  admin_name TEXT DEFAULT 'Admin',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Announcements viewable by all" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Admins insert announcements" ON public.announcements FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','moderator'))
);
CREATE POLICY "Admins delete announcements" ON public.announcements FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','moderator'))
);

-- Support tickets
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  attachment_url TEXT,
  status TEXT DEFAULT 'open',
  admin_reply TEXT,
  admin_reply_attachment TEXT,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own tickets" ON public.support_tickets FOR SELECT TO authenticated USING (
  auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','moderator'))
);
CREATE POLICY "Users can create tickets" ON public.support_tickets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update tickets" ON public.support_tickets FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','moderator'))
);

-- Ticket replies
CREATE TABLE public.ticket_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  message TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  attachment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.ticket_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ticket replies viewable" ON public.ticket_replies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can add replies" ON public.ticket_replies FOR INSERT TO authenticated WITH CHECK (true);

-- Audit logs
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  admin_id UUID,
  admin_name TEXT,
  action TEXT NOT NULL,
  type TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own logs" ON public.audit_logs FOR SELECT TO authenticated USING (
  auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','moderator'))
);
CREATE POLICY "Anyone can insert logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Platform settings
CREATE TABLE public.platform_settings (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT DEFAULT ''
);
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Settings viewable by all" ON public.platform_settings FOR SELECT USING (true);
CREATE POLICY "Admins can update settings" ON public.platform_settings FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','moderator'))
);

INSERT INTO public.platform_settings (key, value) VALUES
  ('maintenance_mode', 'false'),
  ('terms_and_conditions', 'Welcome to Rejoice Trust Ajo Platform. By using this platform, you agree to contribute on time and follow all group rules.');

-- Contact info
CREATE TABLE public.contact_info (
  id INTEGER PRIMARY KEY DEFAULT 1,
  whatsapp TEXT DEFAULT '',
  facebook TEXT DEFAULT '',
  email TEXT DEFAULT '',
  call_number TEXT DEFAULT '',
  sms_number TEXT DEFAULT ''
);
ALTER TABLE public.contact_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Contact info viewable by all" ON public.contact_info FOR SELECT USING (true);
CREATE POLICY "Admins can update contact info" ON public.contact_info FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','moderator'))
);
INSERT INTO public.contact_info (id) VALUES (1);

-- Exit requests
CREATE TABLE public.exit_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.groups(id),
  user_id UUID REFERENCES auth.users(id),
  reason TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.exit_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Exit requests viewable" ON public.exit_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users create exit requests" ON public.exit_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins update exit requests" ON public.exit_requests FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','moderator'))
);

-- Seat change requests
CREATE TABLE public.seat_change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.groups(id),
  user_id UUID REFERENCES auth.users(id),
  current_seat INTEGER,
  requested_seat INTEGER,
  reason TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.seat_change_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Seat changes viewable" ON public.seat_change_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users create seat changes" ON public.seat_change_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins update seat changes" ON public.seat_change_requests FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','moderator'))
);

-- Disbursements
CREATE TABLE public.disbursements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT DEFAULT ('DB-' || substr(gen_random_uuid()::text, 1, 8)),
  user_id UUID REFERENCES auth.users(id),
  group_id UUID REFERENCES public.groups(id),
  group_name TEXT,
  amount NUMERIC DEFAULT 0,
  description TEXT,
  seat_numbers TEXT,
  proof_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.disbursements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Disbursements viewable" ON public.disbursements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins insert disbursements" ON public.disbursements FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','moderator'))
);

-- User debts
CREATE TABLE public.user_debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  group_id UUID REFERENCES public.groups(id),
  group_name TEXT,
  amount NUMERIC DEFAULT 0,
  description TEXT,
  is_paid BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.user_debts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Debts viewable" ON public.user_debts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage debts" ON public.user_debts FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','moderator'))
);
CREATE POLICY "Admins update debts" ON public.user_debts FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','moderator'))
);

-- Guide tips
CREATE TABLE public.guide_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.guide_tips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Guide tips viewable" ON public.guide_tips FOR SELECT USING (true);

-- RPC functions
CREATE OR REPLACE FUNCTION public.get_leaderboard()
RETURNS TABLE(id UUID, first_name TEXT, last_name TEXT, nickname TEXT, is_vip BOOLEAN, profile_picture TEXT, total_paid NUMERIC, trust_score INTEGER)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id, first_name, last_name, nickname, is_vip, profile_picture, total_paid, trust_score
  FROM public.profiles
  WHERE is_banned = false
  ORDER BY total_paid DESC
  LIMIT 20;
$$;

CREATE OR REPLACE FUNCTION public.get_platform_stats()
RETURNS JSON LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE result JSON;
BEGIN
  SELECT json_build_object(
    'totalUsers', (SELECT count(*) FROM public.profiles),
    'activeGroups', (SELECT count(*) FROM public.groups WHERE is_live = true),
    'pendingPayments', (SELECT count(*) FROM public.transactions WHERE status = 'pending'),
    'openTickets', (SELECT count(*) FROM public.support_tickets WHERE status = 'open'),
    'totalRevenue', (SELECT COALESCE(sum(amount), 0) FROM public.transactions WHERE status = 'approved')
  ) INTO result;
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.send_notification_to_all(msg TEXT)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications (user_id, message)
  SELECT id, msg FROM public.profiles;
END;
$$;

CREATE OR REPLACE FUNCTION public.send_notification_to_group(gid UUID, msg TEXT)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications (user_id, message)
  SELECT DISTINCT s.user_id, msg FROM public.slots s WHERE s.group_id = gid AND s.user_id IS NOT NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.send_notification_to_user(uid UUID, msg TEXT)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications (user_id, message) VALUES (uid, msg);
END;
$$;

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-proofs', 'payment-proofs', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-pictures', 'profile-pictures', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('support-attachments', 'support-attachments', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('announcements', 'announcements', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('disbursement-proofs', 'disbursement-proofs', true) ON CONFLICT DO NOTHING;

CREATE POLICY "Public read payment proofs" ON storage.objects FOR SELECT USING (bucket_id = 'payment-proofs');
CREATE POLICY "Upload payment proofs" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'payment-proofs');
CREATE POLICY "Public read profile pics" ON storage.objects FOR SELECT USING (bucket_id = 'profile-pictures');
CREATE POLICY "Upload profile pics" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'profile-pictures');
CREATE POLICY "Update profile pics" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'profile-pictures');
CREATE POLICY "Public read support" ON storage.objects FOR SELECT USING (bucket_id = 'support-attachments');
CREATE POLICY "Upload support" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'support-attachments');
CREATE POLICY "Public read announce" ON storage.objects FOR SELECT USING (bucket_id = 'announcements');
CREATE POLICY "Upload announce" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'announcements');
CREATE POLICY "Public read disb" ON storage.objects FOR SELECT USING (bucket_id = 'disbursement-proofs');
CREATE POLICY "Upload disb" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'disbursement-proofs');

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.slots;
