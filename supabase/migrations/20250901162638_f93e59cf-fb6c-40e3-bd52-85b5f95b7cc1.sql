-- Corrigir as últimas funções que faltaram
CREATE OR REPLACE FUNCTION public.is_felipe_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_email TEXT;
BEGIN
  SELECT email INTO user_email 
  FROM public.profiles 
  WHERE id = auth.uid();
  
  RETURN user_email = 'felipe.souza@socialcriativo.com';
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET name = COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
      email = NEW.email,
      -- Use the role from NEW.raw_user_meta_data if available, otherwise keep existing role
      role = COALESCE(NEW.raw_user_meta_data->>'role', (SELECT role FROM public.profiles WHERE id = NEW.id))
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'vendedor')  -- Use role from metadata if available
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE plpgsql
STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
  RETURN user_role;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$;