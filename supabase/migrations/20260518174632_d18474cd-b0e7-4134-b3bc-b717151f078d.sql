
-- ========== CADASTROS MODULE ==========

-- 1) Update get_current_user_role helper is already in place; we'll use 'admin'/'backoffice' strings.

-- 2) Tables
CREATE TABLE public.client_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salesperson_id UUID NOT NULL,
  salesperson_name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT,
  cnpj TEXT,
  cpf TEXT,
  reason TEXT NOT NULL DEFAULT 'fazer_cadastro',
  status TEXT NOT NULL DEFAULT 'aguardando',
  notes TEXT,
  backoffice_id UUID,
  backoffice_name TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_client_registrations_salesperson ON public.client_registrations(salesperson_id);
CREATE INDEX idx_client_registrations_status ON public.client_registrations(status);
CREATE INDEX idx_client_registrations_created_at ON public.client_registrations(created_at DESC);

ALTER TABLE public.client_registrations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.client_registration_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_id UUID NOT NULL REFERENCES public.client_registrations(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  uploaded_by UUID NOT NULL,
  uploaded_by_name TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_cra_registration ON public.client_registration_attachments(registration_id);
ALTER TABLE public.client_registration_attachments ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.client_registration_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_id UUID NOT NULL REFERENCES public.client_registrations(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_by UUID NOT NULL,
  changed_by_name TEXT,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_cre_registration ON public.client_registration_events(registration_id);
ALTER TABLE public.client_registration_events ENABLE ROW LEVEL SECURITY;

-- 3) RLS Policies
-- client_registrations
CREATE POLICY "Backoffice/Admin manage all registrations"
ON public.client_registrations FOR ALL
USING (get_current_user_role() IN ('admin','backoffice','gestor'))
WITH CHECK (get_current_user_role() IN ('admin','backoffice','gestor'));

CREATE POLICY "Salesperson view own registrations"
ON public.client_registrations FOR SELECT
USING (salesperson_id = auth.uid());

CREATE POLICY "Salesperson insert own registrations"
ON public.client_registrations FOR INSERT
WITH CHECK (salesperson_id = auth.uid());

CREATE POLICY "Salesperson update own pending registrations"
ON public.client_registrations FOR UPDATE
USING (salesperson_id = auth.uid() AND status = 'aguardando');

CREATE POLICY "Salesperson delete own pending registrations"
ON public.client_registrations FOR DELETE
USING (salesperson_id = auth.uid() AND status = 'aguardando');

-- attachments: follow parent visibility
CREATE POLICY "View attachments if can view registration"
ON public.client_registration_attachments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.client_registrations r
    WHERE r.id = registration_id
      AND (
        get_current_user_role() IN ('admin','backoffice','gestor')
        OR r.salesperson_id = auth.uid()
      )
  )
);

CREATE POLICY "Backoffice/Admin manage attachments"
ON public.client_registration_attachments FOR ALL
USING (get_current_user_role() IN ('admin','backoffice','gestor'))
WITH CHECK (get_current_user_role() IN ('admin','backoffice','gestor'));

CREATE POLICY "Salesperson insert attachments to own pending"
ON public.client_registration_attachments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.client_registrations r
    WHERE r.id = registration_id
      AND r.salesperson_id = auth.uid()
      AND r.status = 'aguardando'
  )
);

-- events: read if can read registration
CREATE POLICY "View events if can view registration"
ON public.client_registration_events FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.client_registrations r
    WHERE r.id = registration_id
      AND (
        get_current_user_role() IN ('admin','backoffice','gestor')
        OR r.salesperson_id = auth.uid()
      )
  )
);

CREATE POLICY "Insert events for own actions"
ON public.client_registration_events FOR INSERT
WITH CHECK (changed_by = auth.uid());

-- 4) Trigger: when status changes, log event and set completion fields
CREATE OR REPLACE FUNCTION public.handle_registration_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_name TEXT;
BEGIN
  NEW.updated_at := now();

  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    SELECT name INTO v_user_name FROM profiles WHERE id = auth.uid();

    -- Set backoffice fields when moving to realizado (if not already set)
    IF NEW.status = 'realizado' THEN
      NEW.completed_at := COALESCE(NEW.completed_at, now());
      IF NEW.backoffice_id IS NULL THEN
        NEW.backoffice_id := auth.uid();
        NEW.backoffice_name := v_user_name;
      END IF;
    END IF;

    INSERT INTO public.client_registration_events (registration_id, from_status, to_status, changed_by, changed_by_name)
    VALUES (NEW.id, OLD.status, NEW.status, COALESCE(auth.uid(), NEW.salesperson_id), v_user_name);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_registration_status_change
BEFORE UPDATE ON public.client_registrations
FOR EACH ROW
EXECUTE FUNCTION public.handle_registration_status_change();

-- Initial event on insert
CREATE OR REPLACE FUNCTION public.handle_registration_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_name TEXT;
BEGIN
  SELECT name INTO v_user_name FROM profiles WHERE id = auth.uid();
  INSERT INTO public.client_registration_events (registration_id, from_status, to_status, changed_by, changed_by_name)
  VALUES (NEW.id, NULL, NEW.status, COALESCE(auth.uid(), NEW.salesperson_id), v_user_name);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_registration_insert
AFTER INSERT ON public.client_registrations
FOR EACH ROW
EXECUTE FUNCTION public.handle_registration_insert();

-- 5) Aggregation RPC (bypass 1000-row limit, SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_registrations_summary(p_start DATE, p_end DATE)
RETURNS TABLE (
  total_count BIGINT,
  aguardando_count BIGINT,
  pendente_count BIGINT,
  realizado_count BIGINT,
  cancelado_count BIGINT,
  avg_completion_hours NUMERIC,
  by_reason JSONB,
  by_backoffice JSONB,
  by_day JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role TEXT;
  caller_id UUID;
BEGIN
  caller_id := auth.uid();
  SELECT role INTO caller_role FROM profiles WHERE id = caller_id;

  RETURN QUERY
  WITH base AS (
    SELECT *
    FROM client_registrations
    WHERE created_at::date BETWEEN p_start AND p_end
      AND (
        caller_role IN ('admin','backoffice','gestor')
        OR salesperson_id = caller_id
      )
  )
  SELECT
    COUNT(*)::bigint,
    COUNT(*) FILTER (WHERE status = 'aguardando')::bigint,
    COUNT(*) FILTER (WHERE status = 'pendente')::bigint,
    COUNT(*) FILTER (WHERE status = 'realizado')::bigint,
    COUNT(*) FILTER (WHERE status = 'cancelado')::bigint,
    ROUND(AVG(EXTRACT(EPOCH FROM (completed_at - created_at))/3600.0) FILTER (WHERE completed_at IS NOT NULL)::numeric, 2),
    COALESCE((SELECT jsonb_object_agg(reason, c) FROM (SELECT reason, COUNT(*) c FROM base GROUP BY reason) x), '{}'::jsonb),
    COALESCE((SELECT jsonb_agg(jsonb_build_object('id', backoffice_id, 'name', backoffice_name, 'count', c, 'avg_hours', avg_h))
              FROM (
                SELECT backoffice_id, backoffice_name, COUNT(*) c,
                       ROUND(AVG(EXTRACT(EPOCH FROM (completed_at - created_at))/3600.0)::numeric, 2) avg_h
                FROM base WHERE backoffice_id IS NOT NULL AND status = 'realizado'
                GROUP BY backoffice_id, backoffice_name
              ) y), '[]'::jsonb),
    COALESCE((SELECT jsonb_agg(jsonb_build_object('date', d, 'count', c) ORDER BY d)
              FROM (SELECT created_at::date d, COUNT(*) c FROM base GROUP BY created_at::date) z), '[]'::jsonb)
  FROM base;
END;
$$;

-- 6) Storage bucket for cadastro prints
INSERT INTO storage.buckets (id, name, public)
VALUES ('cadastro-prints', 'cadastro-prints', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read cadastro prints"
ON storage.objects FOR SELECT
USING (bucket_id = 'cadastro-prints');

CREATE POLICY "Authenticated upload cadastro prints"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'cadastro-prints' AND auth.uid() IS NOT NULL);

CREATE POLICY "Backoffice/Admin update cadastro prints"
ON storage.objects FOR UPDATE
USING (bucket_id = 'cadastro-prints' AND get_current_user_role() IN ('admin','backoffice','gestor'));

CREATE POLICY "Backoffice/Admin delete cadastro prints"
ON storage.objects FOR DELETE
USING (bucket_id = 'cadastro-prints' AND get_current_user_role() IN ('admin','backoffice','gestor'));
