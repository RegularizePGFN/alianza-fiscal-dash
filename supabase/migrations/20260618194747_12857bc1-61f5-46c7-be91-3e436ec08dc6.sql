-- Remover duplicados existentes mantendo o mais antigo por (registration_id, file_name)
WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY registration_id, file_name ORDER BY uploaded_at ASC, id ASC) AS rn
  FROM public.client_registration_automation_files
)
DELETE FROM public.client_registration_automation_files f
USING ranked r
WHERE f.id = r.id AND r.rn > 1;

-- Índice único para impedir duplicidade futura
CREATE UNIQUE INDEX IF NOT EXISTS client_registration_automation_files_reg_name_uniq
  ON public.client_registration_automation_files (registration_id, file_name);