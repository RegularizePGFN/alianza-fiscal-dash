
-- Trigger: quando um cadastro é atualizado, se ele estava travado por dados ruins
-- (dados_incompletos/dados_invalidos/error) e agora tem CPF+CNPJ preenchidos
-- (modo automatico e sem backoffice), recoloca na fila da automação.
CREATE OR REPLACE FUNCTION public.reset_registration_to_pending_on_fix()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  cpf_digits text;
  cnpj_digits text;
BEGIN
  IF TG_OP <> 'UPDATE' THEN RETURN NEW; END IF;

  -- Só age se estava travado por dados
  IF OLD.automation_status NOT IN ('dados_incompletos','dados_invalidos','error') THEN
    RETURN NEW;
  END IF;

  -- Só age se o usuário não mudou explicitamente automation_status nesta atualização
  -- (ou seja, NEW.automation_status ainda é igual ao OLD)
  IF NEW.automation_status IS DISTINCT FROM OLD.automation_status THEN
    RETURN NEW;
  END IF;

  -- Só age para modo automático e sem backoffice vinculado
  IF COALESCE(NEW.processing_mode, 'automatico') <> 'automatico' THEN
    RETURN NEW;
  END IF;
  IF NEW.backoffice_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Valida que agora há CPF e CNPJ com a quantidade certa de dígitos
  cpf_digits := regexp_replace(COALESCE(NEW.cpf,''), '\D', '', 'g');
  cnpj_digits := regexp_replace(COALESCE(NEW.cnpj,''), '\D', '', 'g');
  IF length(cpf_digits) <> 11 OR length(cnpj_digits) <> 14 THEN
    RETURN NEW;
  END IF;

  -- Reseta para fila
  NEW.automation_status := 'pending';
  NEW.automation_started_at := NULL;
  NEW.automation_finished_at := NULL;
  NEW.automation_error := NULL;
  NEW.completed_at := NULL;
  IF NEW.status NOT IN ('realizado','cancelado') THEN
    NEW.status := 'aguardando';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_reset_registration_to_pending_on_fix ON public.client_registrations;
CREATE TRIGGER trg_reset_registration_to_pending_on_fix
BEFORE UPDATE ON public.client_registrations
FOR EACH ROW
EXECUTE FUNCTION public.reset_registration_to_pending_on_fix();
