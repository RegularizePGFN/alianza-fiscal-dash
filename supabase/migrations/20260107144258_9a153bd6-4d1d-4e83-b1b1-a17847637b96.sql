-- Adicionar coluna para URL da imagem do prêmio
ALTER TABLE public.motivational_settings
ADD COLUMN prize_image_url TEXT DEFAULT NULL;

-- Criar bucket de storage para imagens do motivacional
INSERT INTO storage.buckets (id, name, public)
VALUES ('motivational', 'motivational', true);

-- Política de leitura pública
CREATE POLICY "Public can view motivational images"
ON storage.objects FOR SELECT
USING (bucket_id = 'motivational');

-- Apenas admins podem fazer upload
CREATE POLICY "Admins can upload motivational images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'motivational' 
  AND get_current_user_role() = 'admin'
);

-- Apenas admins podem atualizar
CREATE POLICY "Admins can update motivational images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'motivational' 
  AND get_current_user_role() = 'admin'
);

-- Apenas admins podem deletar
CREATE POLICY "Admins can delete motivational images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'motivational' 
  AND get_current_user_role() = 'admin'
);