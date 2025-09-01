-- Corrigir os nomes das instâncias para corresponder aos nomes reais na Evolution API
UPDATE user_whatsapp_instances 
SET evolution_instance_id = 'PGFN-Felipe-Santos'
WHERE instance_name = 'Felipe Santos';

UPDATE user_whatsapp_instances 
SET evolution_instance_id = 'PGFN-Livia-Silva'
WHERE instance_name = 'Livia Silva';

-- Verificar os dados atualizados
SELECT instance_name, evolution_instance_id, is_active 
FROM user_whatsapp_instances 
WHERE is_active = true;