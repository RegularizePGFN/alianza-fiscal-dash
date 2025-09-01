-- Habilitar extensões necessárias para cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Criar cron job para processar mensagens a cada minuto
SELECT cron.schedule(
  'process-scheduled-messages',
  '* * * * *', -- Executa a cada minuto
  $$
  SELECT
    net.http_post(
        url:='https://sbxltdbnqixucjoognfj.supabase.co/functions/v1/send-scheduled-messages',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNieGx0ZGJucWl4dWNqb29nbmZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxNDQxMDksImV4cCI6MjA2MTcyMDEwOX0.ZsH2LX5JVFk7tCC0gGmjP1ZrVlQJ78nSUlMqxW7L1rw"}'::jsonb,
        body:='{"time": "' || now() || '"}'::jsonb
    ) as request_id;
  $$
);