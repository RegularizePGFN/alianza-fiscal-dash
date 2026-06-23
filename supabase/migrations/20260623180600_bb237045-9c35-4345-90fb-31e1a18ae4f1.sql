
ALTER TABLE public.client_registrations
  ADD COLUMN IF NOT EXISTS cpf_source text,
  ADD COLUMN IF NOT EXISTS cpf_filled_at timestamptz,
  ADD COLUMN IF NOT EXISTS cpf_filled_by uuid,
  ADD COLUMN IF NOT EXISTS cpf_filled_by_name text;

-- Backfill: automation
UPDATE public.client_registrations r
SET cpf_source = 'automation_pgfn',
    cpf_filled_at = COALESCE(cpf_filled_at, r.updated_at)
WHERE cpf IS NOT NULL AND cpf <> ''
  AND cpf_source IS NULL
  AND pgfn_consulted = true
  AND EXISTS (
    SELECT 1 FROM public.client_registration_automation_files f
    WHERE f.registration_id = r.id AND f.file_type = 'pgfn_screenshot'
  );

-- Backfill: manual (everyone else with CPF)
UPDATE public.client_registrations
SET cpf_source = 'manual',
    cpf_filled_at = COALESCE(cpf_filled_at, updated_at)
WHERE cpf IS NOT NULL AND cpf <> ''
  AND cpf_source IS NULL;
