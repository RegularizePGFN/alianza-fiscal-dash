UPDATE public.client_registrations
SET automation_status = 'completed',
    automation_finished_at = COALESCE(automation_finished_at, now())
WHERE status IN ('realizado','cancelado')
  AND automation_status <> 'completed';