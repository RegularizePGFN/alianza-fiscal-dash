
ALTER TABLE public.client_registration_events ALTER COLUMN changed_by DROP NOT NULL;

CREATE OR REPLACE FUNCTION public.handle_registration_insert()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_name TEXT;
  v_changed_by UUID;
BEGIN
  v_changed_by := COALESCE(auth.uid(), NEW.salesperson_id);

  IF v_changed_by IS NOT NULL THEN
    SELECT name INTO v_user_name FROM profiles WHERE id = v_changed_by;
  END IF;

  IF v_user_name IS NULL THEN
    v_user_name := CASE
      WHEN NEW.source = 'chatbot' THEN 'Chatbot'
      ELSE 'Sistema'
    END;
  END IF;

  INSERT INTO public.client_registration_events (registration_id, from_status, to_status, changed_by, changed_by_name)
  VALUES (NEW.id, NULL, NEW.status, v_changed_by, v_user_name);
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_registration_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_name TEXT;
  v_changed_by UUID;
BEGIN
  NEW.updated_at := now();

  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    v_changed_by := COALESCE(auth.uid(), NEW.backoffice_id, NEW.salesperson_id);

    IF v_changed_by IS NOT NULL THEN
      SELECT name INTO v_user_name FROM profiles WHERE id = v_changed_by;
    END IF;

    IF v_user_name IS NULL THEN
      v_user_name := CASE
        WHEN NEW.source = 'chatbot' THEN 'Chatbot'
        ELSE 'Sistema'
      END;
    END IF;

    -- Set backoffice fields when moving to realizado (if not already set)
    IF NEW.status = 'realizado' THEN
      NEW.completed_at := COALESCE(NEW.completed_at, now());
      IF NEW.backoffice_id IS NULL AND auth.uid() IS NOT NULL THEN
        NEW.backoffice_id := auth.uid();
        NEW.backoffice_name := v_user_name;
      END IF;
    END IF;

    INSERT INTO public.client_registration_events (registration_id, from_status, to_status, changed_by, changed_by_name)
    VALUES (NEW.id, OLD.status, NEW.status, v_changed_by, v_user_name);
  END IF;

  RETURN NEW;
END;
$function$;
