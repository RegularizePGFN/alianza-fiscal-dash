-- Adicionar campos necessários para a Evolution API
ALTER TABLE user_whatsapp_instances 
ADD COLUMN evolution_instance_id TEXT,
ADD COLUMN evolution_api_url TEXT DEFAULT 'http://localhost:8080',
ADD COLUMN evolution_api_key TEXT;

-- Atualizar a instância existente com dados de exemplo (você precisará ajustar)
UPDATE user_whatsapp_instances 
SET 
  evolution_instance_id = instance_name,
  evolution_api_url = 'http://localhost:8080',
  evolution_api_key = instance_token
WHERE instance_name IS NOT NULL;