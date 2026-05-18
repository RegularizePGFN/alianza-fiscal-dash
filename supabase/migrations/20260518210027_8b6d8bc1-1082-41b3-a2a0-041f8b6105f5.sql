-- Backoffice pode ver todas as propostas
CREATE POLICY "Backoffice can view all proposals"
ON public.proposals FOR SELECT
USING (get_current_user_role() = 'backoffice');

-- Backoffice pode atualizar propostas (restrito por trigger)
CREATE POLICY "Backoffice can update proposals"
ON public.proposals FOR UPDATE
USING (get_current_user_role() = 'backoffice');

CREATE OR REPLACE FUNCTION public.restrict_backoffice_proposal_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF get_current_user_role() = 'backoffice' THEN
    IF NEW.client_name IS DISTINCT FROM OLD.client_name
       OR NEW.cnpj IS DISTINCT FROM OLD.cnpj
       OR NEW.client_phone IS DISTINCT FROM OLD.client_phone
       OR NEW.client_email IS DISTINCT FROM OLD.client_email
       OR NEW.total_debt IS DISTINCT FROM OLD.total_debt
       OR NEW.debt_number IS DISTINCT FROM OLD.debt_number
       OR NEW.discounted_value IS DISTINCT FROM OLD.discounted_value
       OR NEW.discount_percentage IS DISTINCT FROM OLD.discount_percentage
       OR NEW.entry_value IS DISTINCT FROM OLD.entry_value
       OR NEW.entry_installments IS DISTINCT FROM OLD.entry_installments
       OR NEW.installments IS DISTINCT FROM OLD.installments
       OR NEW.installment_value IS DISTINCT FROM OLD.installment_value
       OR NEW.fees_value IS DISTINCT FROM OLD.fees_value
       OR NEW.business_activity IS DISTINCT FROM OLD.business_activity
       OR NEW.user_id IS DISTINCT FROM OLD.user_id THEN
      RAISE EXCEPTION 'Backoffice pode alterar apenas status e print da proposta';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS restrict_backoffice_proposal_update_trg ON public.proposals;
CREATE TRIGGER restrict_backoffice_proposal_update_trg
BEFORE UPDATE ON public.proposals
FOR EACH ROW EXECUTE FUNCTION public.restrict_backoffice_proposal_update();

-- Backoffice pode ver todas as vendas
CREATE POLICY "Backoffice can view all sales"
ON public.sales FOR SELECT
USING (get_current_user_role() = 'backoffice');