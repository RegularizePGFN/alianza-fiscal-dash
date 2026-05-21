
-- Colunas de automação em client_registrations
ALTER TABLE public.client_registrations
  ADD COLUMN IF NOT EXISTS automation_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS automation_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS automation_finished_at timestamptz,
  ADD COLUMN IF NOT EXISTS automation_error text,
  ADD COLUMN IF NOT EXISTS automation_attempts int NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_client_registrations_automation_status
  ON public.client_registrations(automation_status);

-- Tabela de arquivos da automação
CREATE TABLE IF NOT EXISTS public.client_registration_automation_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL REFERENCES public.client_registrations(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  file_name text NOT NULL,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_automation_files_registration
  ON public.client_registration_automation_files(registration_id);

ALTER TABLE public.client_registration_automation_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View automation files if can view registration"
  ON public.client_registration_automation_files FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM client_registrations r
    WHERE r.id = client_registration_automation_files.registration_id
      AND (
        get_current_user_role() = ANY (ARRAY['admin','backoffice','gestor'])
        OR r.salesperson_id = auth.uid()
      )
  ));

-- Bucket privado para PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('cadastro-automatico-pdfs', 'cadastro-automatico-pdfs', false)
ON CONFLICT (id) DO NOTHING;

-- Acesso via edge function (service role); leitura RLS para usuários autorizados via signed URL
CREATE POLICY "Authorized users read automation pdfs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'cadastro-automatico-pdfs'
    AND EXISTS (
      SELECT 1 FROM client_registrations r
      WHERE r.id::text = (storage.foldername(name))[1]
        AND (
          get_current_user_role() = ANY (ARRAY['admin','backoffice','gestor'])
          OR r.salesperson_id = auth.uid()
        )
    )
  );
