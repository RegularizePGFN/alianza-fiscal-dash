-- Habilitar RLS nas tabelas restantes que estão sem proteção
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_whatsapp_instances ENABLE ROW LEVEL SECURITY;