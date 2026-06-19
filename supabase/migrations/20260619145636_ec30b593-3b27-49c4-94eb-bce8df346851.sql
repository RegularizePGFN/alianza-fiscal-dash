ALTER TABLE public.client_registrations ADD COLUMN IF NOT EXISTS simulation_status TEXT;

ALTER TABLE public.client_registration_automation_files
  ADD COLUMN IF NOT EXISTS file_type TEXT NOT NULL DEFAULT 'pdf';

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'client_registration_automation_files_file_type_check'
  ) THEN
    ALTER TABLE public.client_registration_automation_files
      ADD CONSTRAINT client_registration_automation_files_file_type_check
      CHECK (file_type IN ('pdf','screenshot'));
  END IF;
END $$;

DROP INDEX IF EXISTS public.client_registration_automation_files_reg_name_uniq;
CREATE UNIQUE INDEX IF NOT EXISTS client_registration_automation_files_reg_type_name_uniq
  ON public.client_registration_automation_files (registration_id, file_type, file_name);