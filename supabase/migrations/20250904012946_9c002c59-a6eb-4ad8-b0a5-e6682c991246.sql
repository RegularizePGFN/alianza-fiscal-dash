-- Add missing DELETE policy for scheduled_messages table
CREATE POLICY "Users can delete their own scheduled messages" 
ON public.scheduled_messages 
FOR DELETE 
USING (
  (auth.uid() = user_id) OR 
  (get_current_user_role() = 'admin') OR 
  (EXISTS ( 
    SELECT 1
    FROM (user_whatsapp_instances uwi
      JOIN user_instance_access uia ON ((uwi.id = uia.instance_id)))
    WHERE ((uwi.instance_name = scheduled_messages.instance_name) AND (uia.user_id = auth.uid()))
  ))
);