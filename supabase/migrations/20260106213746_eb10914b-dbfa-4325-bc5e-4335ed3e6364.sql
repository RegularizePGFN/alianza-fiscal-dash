-- Create motivational_settings table
CREATE TABLE public.motivational_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  is_active BOOLEAN NOT NULL DEFAULT false,
  prize_title TEXT NOT NULL DEFAULT 'Prêmio Motivacional',
  prize_description TEXT DEFAULT 'Quem fechar mais contratos ou faturar mais na semana, ganha!',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.motivational_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read the settings
CREATE POLICY "Anyone can view motivational settings"
ON public.motivational_settings
FOR SELECT
USING (true);

-- Only admins can modify
CREATE POLICY "Admins can manage motivational settings"
ON public.motivational_settings
FOR ALL
USING (get_current_user_role() = 'admin');

-- Create trigger for updated_at
CREATE TRIGGER update_motivational_settings_updated_at
BEFORE UPDATE ON public.motivational_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default row
INSERT INTO public.motivational_settings (is_active, prize_title, prize_description)
VALUES (true, 'Almoço na Churrascaria Tropeiro', '2 ganhadores: quem fechar mais contratos + quem faturar mais na semana!');