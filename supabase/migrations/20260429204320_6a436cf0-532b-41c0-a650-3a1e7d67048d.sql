CREATE OR REPLACE FUNCTION public.set_proposal_validity_date()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.validity_date IS NULL THEN
    NEW.validity_date := NEW.creation_date + interval '24 hours';
  END IF;
  RETURN NEW;
END;
$$;