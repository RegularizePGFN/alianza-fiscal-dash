-- Corrigir search_path das funções para melhorar segurança
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.set_proposal_validity_date()
RETURNS TRIGGER AS $$
BEGIN
  NEW.validity_date = NEW.creation_date + interval '24 hours';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.clean_duplicate_proposals()
RETURNS TABLE(deleted_count integer, details text)
LANGUAGE plpgsql SET search_path = public
AS $$
DECLARE
    deleted_rows INTEGER := 0;
    duplicate_group RECORD;
    old_proposal_id UUID;
BEGIN
    -- Para cada grupo de propostas com mesmo CNPJ e total_debt
    FOR duplicate_group IN 
        SELECT cnpj, total_debt, COUNT(*) as count
        FROM proposals 
        WHERE cnpj IS NOT NULL AND total_debt IS NOT NULL
        GROUP BY cnpj, total_debt
        HAVING COUNT(*) > 1
    LOOP
        -- Para cada grupo duplicado, manter apenas a mais recente
        FOR old_proposal_id IN
            SELECT id 
            FROM proposals 
            WHERE cnpj = duplicate_group.cnpj 
              AND total_debt = duplicate_group.total_debt
            ORDER BY created_at DESC 
            OFFSET 1  -- Pular a mais recente (primeira após ordenação)
        LOOP
            DELETE FROM proposals WHERE id = old_proposal_id;
            deleted_rows := deleted_rows + 1;
        END LOOP;
    END LOOP;
    
    RETURN QUERY SELECT deleted_rows, 
                       CASE 
                         WHEN deleted_rows > 0 THEN 
                           'Removed ' || deleted_rows || ' duplicate proposals successfully'
                         ELSE 
                           'No duplicate proposals found'
                       END;
END;
$$;

CREATE OR REPLACE FUNCTION public.prevent_duplicate_proposals()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar se já existe proposta com mesmo CNPJ e total_debt
    IF NEW.cnpj IS NOT NULL AND NEW.total_debt IS NOT NULL THEN
        -- Excluir propostas existentes com mesmo CNPJ + total_debt
        DELETE FROM proposals 
        WHERE cnpj = NEW.cnpj 
          AND total_debt = NEW.total_debt
          AND id != COALESCE(NEW.id, gen_random_uuid()); -- Evitar auto-exclusão em updates
        
        -- Log da operação (opcional)
        IF FOUND THEN
            RAISE NOTICE 'Removed existing proposal(s) for CNPJ % with total_debt %', NEW.cnpj, NEW.total_debt;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;