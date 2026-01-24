CREATE OR REPLACE FUNCTION public.get_weekly_ranking(
  p_start_date date DEFAULT NULL,
  p_end_date date DEFAULT NULL
)
RETURNS TABLE (
  salesperson_id uuid,
  salesperson_name text,
  contracts_count bigint,
  total_amount numeric,
  volume_position integer,
  amount_position integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  period_start date;
  period_end date;
BEGIN
  -- Usar parâmetros se fornecidos
  IF p_start_date IS NOT NULL AND p_end_date IS NOT NULL THEN
    period_start := p_start_date;
    period_end := p_end_date;
  ELSE
    -- Buscar das configurações motivacionais
    SELECT start_date, end_date INTO period_start, period_end
    FROM motivational_settings LIMIT 1;
    
    -- Fallback para semana atual
    IF period_start IS NULL OR period_end IS NULL THEN
      period_start := date_trunc('week', CURRENT_DATE)::date;
      period_end := period_start + interval '6 days';
    END IF;
  END IF;
  
  RETURN QUERY
  WITH sales_data AS (
    SELECT 
      s.salesperson_id,
      COALESCE(p.name, s.salesperson_name, 'Desconhecido') as name,
      COUNT(*)::bigint as contracts,
      COALESCE(SUM(s.gross_amount), 0) as amount
    FROM sales s
    LEFT JOIN profiles p ON p.id = s.salesperson_id
    WHERE s.sale_date >= period_start 
      AND s.sale_date <= period_end
    GROUP BY s.salesperson_id, p.name, s.salesperson_name
  ),
  ranked_data AS (
    SELECT 
      sd.salesperson_id,
      sd.name,
      sd.contracts,
      sd.amount,
      ROW_NUMBER() OVER (ORDER BY sd.contracts DESC, sd.amount DESC)::integer as vol_pos,
      ROW_NUMBER() OVER (ORDER BY sd.amount DESC, sd.contracts DESC)::integer as amt_pos
    FROM sales_data sd
  )
  SELECT 
    rd.salesperson_id,
    rd.name,
    rd.contracts,
    rd.amount,
    rd.vol_pos,
    rd.amt_pos
  FROM ranked_data rd
  ORDER BY rd.vol_pos;
END;
$function$;