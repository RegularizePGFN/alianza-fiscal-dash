
-- Tabela principal de equipamentos
CREATE TABLE public.equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tag text UNIQUE NOT NULL,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'outros',
  brand text,
  model text,
  serial_number text,
  imei text,
  acquisition_date date,
  acquisition_value numeric,
  condition text NOT NULL DEFAULT 'bom',
  status text NOT NULL DEFAULT 'disponivel',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Histórico de atribuições
CREATE TABLE public.equipment_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id uuid NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  user_name text NOT NULL,
  assigned_at date NOT NULL DEFAULT CURRENT_DATE,
  returned_at date,
  condition_on_assign text,
  condition_on_return text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_equipment_assignments_equipment ON public.equipment_assignments(equipment_id);
CREATE INDEX idx_equipment_assignments_active ON public.equipment_assignments(equipment_id) WHERE returned_at IS NULL;

-- RLS
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage equipment"
  ON public.equipment FOR ALL
  USING (public.get_current_user_role() = 'admin')
  WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins manage equipment assignments"
  ON public.equipment_assignments FOR ALL
  USING (public.get_current_user_role() = 'admin')
  WITH CHECK (public.get_current_user_role() = 'admin');

-- Trigger: gera tag sequencial EQ-0001
CREATE OR REPLACE FUNCTION public.set_equipment_tag()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_num int;
BEGIN
  IF NEW.tag IS NULL OR trim(NEW.tag) = '' THEN
    SELECT COALESCE(MAX(NULLIF(regexp_replace(tag, '\D', '', 'g'), '')::int), 0) + 1
      INTO next_num
      FROM public.equipment
      WHERE tag ~ '^EQ-\d+$';
    NEW.tag := 'EQ-' || lpad(next_num::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_set_equipment_tag
  BEFORE INSERT ON public.equipment
  FOR EACH ROW EXECUTE FUNCTION public.set_equipment_tag();

-- Trigger: updated_at
CREATE TRIGGER trg_equipment_updated_at
  BEFORE UPDATE ON public.equipment
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: sincroniza status do equipamento conforme atribuições
CREATE OR REPLACE FUNCTION public.sync_equipment_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_equipment_id uuid;
  v_has_active boolean;
  v_current_status text;
BEGIN
  v_equipment_id := COALESCE(NEW.equipment_id, OLD.equipment_id);

  SELECT EXISTS(
    SELECT 1 FROM public.equipment_assignments
    WHERE equipment_id = v_equipment_id AND returned_at IS NULL
  ) INTO v_has_active;

  SELECT status INTO v_current_status FROM public.equipment WHERE id = v_equipment_id;

  -- Não sobrescrever estados administrativos
  IF v_current_status IN ('manutencao', 'aposentado') THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF v_has_active THEN
    UPDATE public.equipment SET status = 'em_uso' WHERE id = v_equipment_id AND status <> 'em_uso';
  ELSE
    UPDATE public.equipment SET status = 'disponivel' WHERE id = v_equipment_id AND status <> 'disponivel';
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_sync_equipment_status
  AFTER INSERT OR UPDATE OR DELETE ON public.equipment_assignments
  FOR EACH ROW EXECUTE FUNCTION public.sync_equipment_status();
