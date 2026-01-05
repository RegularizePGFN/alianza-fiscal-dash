-- Create optimized RPC function to get all today's dashboard data in one query
CREATE OR REPLACE FUNCTION public.get_today_dashboard_summary(p_user_id uuid DEFAULT NULL)
RETURNS TABLE(
  total_sales_count bigint,
  total_sales_amount numeric,
  total_proposals_count bigint,
  total_fees numeric,
  salespeople jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  today_date date := CURRENT_DATE;
  user_role text;
BEGIN
  -- Get user role
  SELECT role INTO user_role FROM profiles WHERE id = COALESCE(p_user_id, auth.uid());
  
  RETURN QUERY
  WITH sales_today AS (
    SELECT 
      s.salesperson_id,
      s.salesperson_name,
      COUNT(*)::bigint as sales_count,
      COALESCE(SUM(s.gross_amount), 0) as sales_amount
    FROM sales s
    WHERE s.sale_date = today_date
      AND (user_role = 'admin' OR s.salesperson_id = COALESCE(p_user_id, auth.uid()))
    GROUP BY s.salesperson_id, s.salesperson_name
  ),
  proposals_today AS (
    SELECT 
      p.user_id,
      COUNT(*)::bigint as proposals_count,
      COALESCE(SUM(COALESCE(p.fees_value, 0)), 0) as fees_amount
    FROM proposals p
    WHERE p.created_at >= today_date::timestamp
      AND p.created_at < (today_date + interval '1 day')::timestamp
      AND (user_role = 'admin' OR p.user_id = COALESCE(p_user_id, auth.uid()))
    GROUP BY p.user_id
  ),
  all_salespeople AS (
    SELECT 
      pr.id,
      pr.name,
      pr.contract_type,
      pr.email,
      COALESCE(st.sales_count, 0) as sales_count,
      COALESCE(st.sales_amount, 0) as sales_amount,
      COALESCE(pt.proposals_count, 0) as proposals_count,
      COALESCE(pt.fees_amount, 0) as fees_amount
    FROM profiles pr
    LEFT JOIN sales_today st ON st.salesperson_id = pr.id
    LEFT JOIN proposals_today pt ON pt.user_id = pr.id
    WHERE pr.role = 'vendedor'
      AND (user_role = 'admin' OR pr.id = COALESCE(p_user_id, auth.uid()))
  )
  SELECT
    COALESCE(SUM(asp.sales_count), 0)::bigint as total_sales_count,
    COALESCE(SUM(asp.sales_amount), 0) as total_sales_amount,
    COALESCE(SUM(asp.proposals_count), 0)::bigint as total_proposals_count,
    COALESCE(SUM(asp.fees_amount), 0) as total_fees,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', asp.id,
          'name', asp.name,
          'contractType', asp.contract_type,
          'email', asp.email,
          'salesCount', asp.sales_count,
          'salesAmount', asp.sales_amount,
          'proposalsCount', asp.proposals_count,
          'feesAmount', asp.fees_amount
        )
      ) FILTER (WHERE asp.id IS NOT NULL),
      '[]'::jsonb
    ) as salespeople
  FROM all_salespeople asp;
END;
$$;