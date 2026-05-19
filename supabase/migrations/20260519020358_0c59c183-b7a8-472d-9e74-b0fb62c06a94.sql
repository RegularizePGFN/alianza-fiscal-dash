
-- Enable realtime for client_registrations
ALTER TABLE public.client_registrations REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.client_registrations;

-- Allow trigger (SECURITY DEFINER) to insert notifications
CREATE POLICY "System can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Trigger: when a registration status changes, notify the salesperson
CREATE OR REPLACE FUNCTION public.notify_salesperson_on_registration_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_message text;
  v_type text;
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

    INSERT INTO public.notifications (user_id, message, type, read)
    VALUES (NEW.salesperson_id, v_message, v_type, false);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_salesperson_on_registration_status_change_trg ON public.client_registrations;
CREATE TRIGGER notify_salesperson_on_registration_status_change_trg
AFTER UPDATE ON public.client_registrations
FOR EACH ROW
EXECUTE FUNCTION public.notify_salesperson_on_registration_status_change();
