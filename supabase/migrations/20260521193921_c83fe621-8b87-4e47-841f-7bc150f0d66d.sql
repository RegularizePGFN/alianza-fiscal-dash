UPDATE public.client_registrations
SET automation_status = 'dados_incompletos',
    automation_finished_at = COALESCE(automation_finished_at, now())
WHERE automation_status IN ('pending','processing','error')
  AND (cpf IS NULL OR cnpj IS NULL);