-- Add foreign key relationship between user_instance_access and profiles
ALTER TABLE public.user_instance_access 
ADD CONSTRAINT user_instance_access_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;