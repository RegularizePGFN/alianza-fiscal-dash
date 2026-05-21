ALTER TABLE public.client_registrations
  ADD COLUMN IF NOT EXISTS automation_status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS automation_started_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS automation_finished_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS automation_error text,
  ADD COLUMN IF NOT EXISTS automation_attempts integer DEFAULT 0;

UPDATE public.client_registrations
  SET automation_status = 'pending'
  WHERE automation_status IS NULL;

CREATE TABLE IF NOT EXISTS public.client_registration_automation_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid REFERENCES public.client_registrations(id) ON DELETE CASCADE NOT NULL,
  file_path text NOT NULL,
  file_name text NOT NULL,
  uploaded_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.client_registration_automation_files ENABLE ROW LEVEL SECURITY;

-- Políticas para client_registration_automation_files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'client_registration_automation_files' 
    AND policyname = 'Users can view files from their own registrations'
  ) THEN
    CREATE POLICY "Users can view files from their own registrations"
    ON public.client_registration_automation_files
    FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.client_registrations cr
        WHERE cr.id = client_registration_automation_files.registration_id
          AND (
            cr.salesperson_id = auth.uid()
            OR EXISTS (
              SELECT 1 FROM public.profiles p
              WHERE p.id = auth.uid()
                AND p.role IN ('admin', 'backoffice', 'gestor')
            )
          )
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'client_registration_automation_files' 
    AND policyname = 'Service role can insert automation files'
  ) THEN
    CREATE POLICY "Service role can insert automation files"
    ON public.client_registration_automation_files
    FOR INSERT
    TO authenticated
    WITH CHECK (true);
  END IF;
END
$$;
