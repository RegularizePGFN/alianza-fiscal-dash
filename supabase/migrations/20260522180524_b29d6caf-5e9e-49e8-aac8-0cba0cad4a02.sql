UPDATE public.client_registrations
SET updated_at = now()
WHERE automation_status IN ('dados_incompletos','dados_invalidos','error')
  AND processing_mode = 'automatico'
  AND backoffice_id IS NULL
  AND length(regexp_replace(coalesce(cpf,''),'\D','','g')) = 11
  AND length(regexp_replace(coalesce(cnpj,''),'\D','','g')) = 14;