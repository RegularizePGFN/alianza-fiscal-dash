ALTER TABLE public.equipment DROP COLUMN IF EXISTS imei;
ALTER TABLE public.equipment DROP COLUMN IF EXISTS serial_number;
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS photos text[] NOT NULL DEFAULT '{}'::text[];

INSERT INTO storage.buckets (id, name, public)
VALUES ('equipment-photos', 'equipment-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view equipment photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'equipment-photos');

CREATE POLICY "Admins can upload equipment photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'equipment-photos' AND public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can update equipment photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'equipment-photos' AND public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can delete equipment photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'equipment-photos' AND public.get_current_user_role() = 'admin');
