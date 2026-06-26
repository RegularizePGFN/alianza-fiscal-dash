
CREATE OR REPLACE FUNCTION public.classify_registration_automation_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cpf_digits text;
  cnpj_digits text;
  cpf_valid boolean := false;
  cnpj_valid boolean := false;
BEGIN
  -- Só age em modo automático
  IF COALESCE(NEW.processing_mode, 'automatico') <> 'automatico' THEN
    RETURN NEW;
  END IF;

  -- Só age quando o status é pending (default na criação ou reset)
  IF NEW.automation_status IS DISTINCT FROM 'pending' THEN
    RETURN NEW;
  END IF;

  cpf_digits := regexp_replace(COALESCE(NEW.cpf, ''), '\D', '', 'g');
  cnpj_digits := regexp_replace(COALESCE(NEW.cnpj, ''), '\D', '', 'g');

  -- Sem CNPJ → dados_incompletos
  IF length(cnpj_digits) = 0 THEN
    NEW.automation_status := 'dados_incompletos';
    NEW.automation_finished_at := now();
    RETURN NEW;
  END IF;

  -- CNPJ deve ter 14 dígitos
  cnpj_valid := length(cnpj_digits) = 14;
  IF NOT cnpj_valid THEN
    NEW.automation_status := 'dados_invalidos';
    NEW.automation_finished_at := now();
    RETURN NEW;
  END IF;

  -- Tem CPF? valida tamanho (validação completa fica na edge function)
  IF length(cpf_digits) > 0 THEN
    cpf_valid := length(cpf_digits) = 11;
    IF NOT cpf_valid THEN
      NEW.automation_status := 'dados_invalidos';
      NEW.automation_finished_at := now();
      RETURN NEW;
    END IF;
    -- CNPJ + CPF → mantém pending (fila normal de cadastro completo)
    RETURN NEW;
  END IF;

  -- CNPJ válido sem CPF → já entra direto em aguardando_cpf
  NEW.automation_status := 'aguardando_cpf';
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS classify_registration_automation_status_ins ON public.client_registrations;
CREATE TRIGGER classify_registration_automation_status_ins
BEFORE INSERT ON public.client_registrations
FOR EACH ROW
EXECUTE FUNCTION public.classify_registration_automation_status();

-- Também em UPDATE quando o status volta a pending (ex.: trigger de reset)
DROP TRIGGER IF EXISTS classify_registration_automation_status_upd ON public.client_registrations;
CREATE TRIGGER classify_registration_automation_status_upd
BEFORE UPDATE OF automation_status, cpf, cnpj ON public.client_registrations
FOR EACH ROW
WHEN (NEW.automation_status = 'pending' AND OLD.automation_status IS DISTINCT FROM 'pending')
EXECUTE FUNCTION public.classify_registration_automation_status();
