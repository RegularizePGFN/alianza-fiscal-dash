CREATE OR REPLACE FUNCTION public.notify_salesperson_on_registration_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_message text;
  v_type text;
  v_user_exists boolean;
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    IF NEW.status = 'realizado' THEN
      v_message := 'Cadastro de ' || COALESCE(NEW.client_name, 'cliente') || ' foi concluído';
      v_type := 'registration_done';
    ELSIF NEW.status = 'pendente' THEN
      v_message := 'Cadastro de ' || COALESCE(NEW.client_name, 'cliente') || ' está pendente' ||
                   CASE WHEN NEW.notes IS NOT NULL AND NEW.notes <> '' THEN ': ' || NEW.notes ELSE '' END;
      v_type := 'registration_pending';
    ELSIF NEW.status = 'cancelado' THEN
      v_message := 'Cadastro de ' || COALESCE(NEW.client_name, 'cliente') || ' foi cancelado' ||
                   CASE WHEN NEW.notes IS NOT NULL AND NEW.notes <> '' THEN ': ' || NEW.notes ELSE '' END;
      v_type := 'registration_cancelled';
    ELSE
      RETURN NEW;
    END IF;

    IF NEW.salesperson_id IS NULL THEN
      RETURN NEW;
    END IF;

    SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = NEW.salesperson_id) INTO v_user_exists;
    IF NOT v_user_exists THEN
      RAISE NOTICE 'Skipping notification: salesperson % no longer exists', NEW.salesperson_id;
      RETURN NEW;
    END IF;

    INSERT INTO public.notifications (user_id, message, type, read)
    VALUES (NEW.salesperson_id, v_message, v_type, false);
  END IF;
  RETURN NEW;
END;
$function$;