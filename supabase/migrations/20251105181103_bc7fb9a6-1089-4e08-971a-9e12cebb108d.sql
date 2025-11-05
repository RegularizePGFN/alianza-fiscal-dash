-- Criar função RPC para retornar vendas agregadas da equipe
-- Esta função usa SECURITY DEFINER para bypass RLS e retornar apenas dados agregados
CREATE OR REPLACE FUNCTION get_team_daily_sales(sale_date_param date)
RETURNS TABLE (
  total_sales bigint,
  total_amount numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::bigint as total_sales,
    COALESCE(SUM(gross_amount), 0) as total_amount
  FROM sales
  WHERE sale_date = sale_date_param;
END;
$$;

-- Permitir que usuários autenticados executem a função
GRANT EXECUTE ON FUNCTION get_team_daily_sales(date) TO authenticated;