CREATE OR REPLACE FUNCTION public.prevent_duplicate_proposals()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    IF NEW.cnpj IS NOT NULL AND NEW.total_debt IS NOT NULL THEN
        DELETE FROM proposals 
        WHERE cnpj = NEW.cnpj 
          AND total_debt = NEW.total_debt
          AND id != COALESCE(NEW.id, gen_random_uuid());
        
        IF FOUND THEN
            RAISE NOTICE 'Removed existing proposal(s) for CNPJ % with total_debt %', NEW.cnpj, NEW.total_debt;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$function$;