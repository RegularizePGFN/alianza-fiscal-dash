-- Fix the get_current_user_role function to work properly in RLS context
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- First check if we have auth.uid()
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Get the role from profiles table
  SELECT role INTO user_role 
  FROM public.profiles 
  WHERE id = auth.uid();
  
  RETURN user_role;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Also add a simpler policy that should work for admin users
DROP POLICY IF EXISTS "Users can delete their own scheduled messages" ON public.scheduled_messages;

CREATE POLICY "Users can delete their own scheduled messages" 
ON public.scheduled_messages 
FOR DELETE 
USING (
  -- User owns the message
  auth.uid() = user_id 
  OR 
  -- User is admin (direct check)
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
  OR
  -- User has access to the instance
  EXISTS ( 
    SELECT 1
    FROM user_whatsapp_instances uwi
    JOIN user_instance_access uia ON uwi.id = uia.instance_id
    WHERE uwi.instance_name = scheduled_messages.instance_name 
    AND uia.user_id = auth.uid()
  )
);