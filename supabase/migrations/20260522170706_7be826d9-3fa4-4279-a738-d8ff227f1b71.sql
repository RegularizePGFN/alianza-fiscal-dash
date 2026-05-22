DROP POLICY IF EXISTS "Salesperson update own pending registrations" ON public.client_registrations;

CREATE POLICY "Salesperson update own registrations"
ON public.client_registrations
FOR UPDATE
USING (salesperson_id = auth.uid())
WITH CHECK (salesperson_id = auth.uid());

-- Allow salesperson to attach prints to own registrations regardless of status
DROP POLICY IF EXISTS "Salesperson insert attachments to own pending" ON public.client_registration_attachments;

CREATE POLICY "Salesperson insert attachments to own"
ON public.client_registration_attachments
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.client_registrations r
    WHERE r.id = client_registration_attachments.registration_id
      AND r.salesperson_id = auth.uid()
  )
);