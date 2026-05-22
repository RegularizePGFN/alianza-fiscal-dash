UPDATE public.client_registrations
SET automation_status = 'pending',
    automation_started_at = NULL,
    automation_finished_at = NULL,
    automation_error = NULL,
    status = 'aguardando',
    completed_at = NULL
WHERE automation_status IN ('dados_incompletos','dados_invalidos')
  AND cpf IS NOT NULL AND cnpj IS NOT NULL
  AND length(regexp_replace(cpf,'\D','','g')) = 11
  AND length(regexp_replace(cnpj,'\D','','g')) = 14
  AND processing_mode = 'automatico'
  AND backoffice_id IS NULL;