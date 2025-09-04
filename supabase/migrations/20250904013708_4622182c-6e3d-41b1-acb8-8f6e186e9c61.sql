-- Test direct access for admin user
-- Let's create a simpler policy specifically for admin access
DROP POLICY IF EXISTS "Users can delete their own scheduled messages" ON public.scheduled_messages;

CREATE POLICY "Admin and users can delete scheduled messages" 
ON public.scheduled_messages 
FOR DELETE 
USING (
  -- Allow if user owns the message
  auth.uid() = user_id 
  OR 
  -- Allow if user is admin (direct check without function)
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
  OR
  -- Allow if user has instance access
  EXISTS ( 
    SELECT 1
    FROM user_whatsapp_instances uwi
    JOIN user_instance_access uia ON uwi.id = uia.instance_id
    WHERE uwi.instance_name = scheduled_messages.instance_name 
    AND uia.user_id = auth.uid()
  )
);