
CREATE OR REPLACE FUNCTION public.require_cpf_on_registration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.cpf IS NULL OR btrim(NEW.cpf) = '' THEN
    RAISE EXCEPTION 'CPF é obrigatório para cadastrar cliente';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_require_cpf_on_registration ON public.client_registrations;
CREATE TRIGGER trg_require_cpf_on_registration
BEFORE INSERT ON public.client_registrations
FOR EACH ROW EXECUTE FUNCTION public.require_cpf_on_registration();
