-- Função RPC para obter ranking semanal de vendedores
CREATE OR REPLACE FUNCTION public.get_weekly_ranking()
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
  week_start date;
  week_end date;
BEGIN
  -- Calcular início da semana (segunda-feira)
  week_start := date_trunc('week', CURRENT_DATE)::date;
  -- Fim da semana (domingo)
  week_end := week_start + interval '6 days';
  
  RETURN QUERY
  WITH sales_data AS (
    SELECT 
      s.salesperson_id,
      COALESCE(p.name, s.salesperson_name, 'Desconhecido') as name,
      COUNT(*)::bigint as contracts,
      COALESCE(SUM(s.gross_amount), 0) as amount
    FROM sales s
    LEFT JOIN profiles p ON p.id = s.salesperson_id
    WHERE s.sale_date >= week_start 
      AND s.sale_date <= week_end
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