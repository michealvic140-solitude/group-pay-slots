ALTER TABLE public.transactions DROP CONSTRAINT transactions_user_id_fkey;
ALTER TABLE public.transactions ADD CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.disbursements DROP CONSTRAINT disbursements_user_id_fkey;
ALTER TABLE public.disbursements ADD CONSTRAINT disbursements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.user_debts DROP CONSTRAINT user_debts_user_id_fkey;
ALTER TABLE public.user_debts ADD CONSTRAINT user_debts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;