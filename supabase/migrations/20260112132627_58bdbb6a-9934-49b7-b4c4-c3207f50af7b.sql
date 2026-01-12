-- Add ranking_type column to motivational_settings
ALTER TABLE public.motivational_settings
ADD COLUMN ranking_type TEXT DEFAULT 'both' 
CHECK (ranking_type IN ('volume', 'amount', 'both'));

-- Add comment for documentation
COMMENT ON COLUMN public.motivational_settings.ranking_type IS 'Type of ranking to display: volume (contracts count), amount (revenue), or both';