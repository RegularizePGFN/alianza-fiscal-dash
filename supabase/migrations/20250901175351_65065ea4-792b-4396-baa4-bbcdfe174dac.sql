-- Adicionar política para que admins possam ver todas as propostas
CREATE POLICY "Admins podem ver todas as propostas"
ON public.proposals
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);