ALTER TABLE public.slots DROP CONSTRAINT slots_user_id_fkey;
ALTER TABLE public.slots ADD CONSTRAINT slots_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;