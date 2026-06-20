ALTER TABLE public.client_registrations ADD COLUMN IF NOT EXISTS pgfn_consulted boolean DEFAULT false;
ALTER TABLE public.client_registrations ADD COLUMN IF NOT EXISTS pgfn_screenshot text;