
-- =========================================================
-- Inteligência Comercial: RPCs (admin only)
-- =========================================================

-- 1) Conversões: vendas com a proposta correspondente (mesmo CNPJ + mesmo vendedor, proposta mais recente <= venda)
CREATE OR REPLACE FUNCTION public.get_proposal_to_sale_conversion(
  p_start date,
  p_end date,
  p_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  sale_id uuid,
  salesperson_id uuid,
  salesperson_name text,
  client_name text,
  cnpj_normalized text,
  sale_date date,
  sale_amount numeric,
  payment_method text,
  proposal_id uuid,
  proposal_created_at timestamp with time zone,
  proposal_total_debt numeric,
  proposal_discounted_value numeric,
  proposal_fees_value numeric,
  days_to_convert integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role text;
BEGIN
  SELECT role INTO caller_role FROM profiles WHERE id = auth.uid();
  IF caller_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  RETURN QUERY
  WITH s AS (
    SELECT
      sa.id AS sale_id,
      sa.salesperson_id,
      COALESCE(pr.name, sa.salesperson_name) AS salesperson_name,
      sa.client_name,
      regexp_replace(COALESCE(sa.client_document, ''), '\D', '', 'g') AS cnpj_norm,
      sa.sale_date,
      sa.gross_amount,
      sa.payment_method
    FROM sales sa
    LEFT JOIN profiles pr ON pr.id = sa.salesperson_id
    WHERE sa.sale_date >= p_start
      AND sa.sale_date <= p_end
      AND (p_user_id IS NULL OR sa.salesperson_id = p_user_id)
  )
  SELECT
    s.sale_id,
    s.salesperson_id,
    s.salesperson_name,
    s.client_name,
    s.cnpj_norm,
    s.sale_date,
    s.gross_amount,
    s.payment_method,
    p.id,
    p.created_at,
    p.total_debt,
    p.discounted_value,
    p.fees_value,
    CASE WHEN p.id IS NULL THEN NULL
         ELSE (s.sale_date - (p.created_at AT TIME ZONE 'America/Sao_Paulo')::date)
    END
  FROM s
  LEFT JOIN LATERAL (
    SELECT pp.*
    FROM proposals pp
    WHERE pp.cnpj IS NOT NULL
      AND regexp_replace(pp.cnpj, '\D', '', 'g') = s.cnpj_norm
      AND s.cnpj_norm <> ''
      AND pp.user_id = s.salesperson_id
      AND (pp.created_at AT TIME ZONE 'America/Sao_Paulo')::date <= s.sale_date
    ORDER BY pp.created_at DESC
    LIMIT 1
  ) p ON TRUE;
END;
$$;

-- 2) Sumário/KPIs
CREATE OR REPLACE FUNCTION public.get_commercial_intel_summary(
  p_start date,
  p_end date,
  p_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  total_proposals bigint,
  total_proposals_value numeric,
  total_sales bigint,
  total_sales_value numeric,
  matched_sales bigint,
  matched_sales_value numeric,
  conversion_rate numeric,
  avg_days_to_convert numeric,
  median_days_to_convert numeric,
  same_day_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role text;
BEGIN
  SELECT role INTO caller_role FROM profiles WHERE id = auth.uid();
  IF caller_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  RETURN QUERY
  WITH props AS (
    SELECT id, total_debt
    FROM proposals
    WHERE (created_at AT TIME ZONE 'America/Sao_Paulo')::date BETWEEN p_start AND p_end
      AND (p_user_id IS NULL OR user_id = p_user_id)
  ),
  conv AS (
    SELECT * FROM get_proposal_to_sale_conversion(p_start, p_end, p_user_id)
  ),
  conv_stats AS (
    SELECT
      COUNT(*)::bigint AS total_sales,
      COALESCE(SUM(sale_amount),0) AS total_sales_value,
      COUNT(*) FILTER (WHERE proposal_id IS NOT NULL)::bigint AS matched_sales,
      COALESCE(SUM(sale_amount) FILTER (WHERE proposal_id IS NOT NULL),0) AS matched_sales_value,
      AVG(days_to_convert) FILTER (WHERE proposal_id IS NOT NULL) AS avg_days,
      percentile_cont(0.5) WITHIN GROUP (ORDER BY days_to_convert) FILTER (WHERE proposal_id IS NOT NULL) AS median_days,
      COUNT(*) FILTER (WHERE proposal_id IS NOT NULL AND days_to_convert = 0)::bigint AS same_day
    FROM conv
  )
  SELECT
    (SELECT COUNT(*) FROM props)::bigint,
    (SELECT COALESCE(SUM(total_debt),0) FROM props),
    cs.total_sales,
    cs.total_sales_value,
    cs.matched_sales,
    cs.matched_sales_value,
    CASE WHEN (SELECT COUNT(*) FROM props) = 0 THEN 0
         ELSE ROUND(cs.matched_sales::numeric / (SELECT COUNT(*) FROM props)::numeric * 100, 2)
    END,
    ROUND(COALESCE(cs.avg_days,0)::numeric, 2),
    ROUND(COALESCE(cs.median_days,0)::numeric, 2),
    cs.same_day
  FROM conv_stats cs;
END;
$$;

-- 3) Propostas em aberto (sem venda correspondente do mesmo vendedor + CNPJ até hoje)
CREATE OR REPLACE FUNCTION public.get_open_proposals(
  p_start date,
  p_end date,
  p_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  proposal_id uuid,
  salesperson_id uuid,
  salesperson_name text,
  client_name text,
  client_phone text,
  cnpj text,
  total_debt numeric,
  discounted_value numeric,
  fees_value numeric,
  created_at timestamp with time zone,
  aging_days integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role text;
BEGIN
  SELECT role INTO caller_role FROM profiles WHERE id = auth.uid();
  IF caller_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.user_id,
    pr.name,
    p.client_name,
    p.client_phone,
    p.cnpj,
    p.total_debt,
    p.discounted_value,
    p.fees_value,
    p.created_at,
    ((CURRENT_DATE) - (p.created_at AT TIME ZONE 'America/Sao_Paulo')::date)::integer AS aging_days
  FROM proposals p
  LEFT JOIN profiles pr ON pr.id = p.user_id
  WHERE (p.created_at AT TIME ZONE 'America/Sao_Paulo')::date BETWEEN p_start AND p_end
    AND (p_user_id IS NULL OR p.user_id = p_user_id)
    AND p.cnpj IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM sales s
      WHERE s.salesperson_id = p.user_id
        AND regexp_replace(COALESCE(s.client_document,''),'\D','','g') = regexp_replace(p.cnpj,'\D','','g')
        AND s.sale_date >= (p.created_at AT TIME ZONE 'America/Sao_Paulo')::date
    );
END;
$$;

-- 4) Padrões por dia da semana e hora (timezone São Paulo)
CREATE OR REPLACE FUNCTION public.get_hourly_patterns(
  p_start date,
  p_end date,
  p_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  source text,           -- 'proposal' | 'sale'
  dow integer,           -- 0=Sun..6=Sat
  hour integer,          -- 0..23
  count bigint,
  total_value numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role text;
BEGIN
  SELECT role INTO caller_role FROM profiles WHERE id = auth.uid();
  IF caller_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  RETURN QUERY
  SELECT
    'proposal'::text,
    EXTRACT(DOW FROM (p.created_at AT TIME ZONE 'America/Sao_Paulo'))::integer,
    EXTRACT(HOUR FROM (p.created_at AT TIME ZONE 'America/Sao_Paulo'))::integer,
    COUNT(*)::bigint,
    COALESCE(SUM(p.total_debt),0)
  FROM proposals p
  WHERE (p.created_at AT TIME ZONE 'America/Sao_Paulo')::date BETWEEN p_start AND p_end
    AND (p_user_id IS NULL OR p.user_id = p_user_id)
  GROUP BY 2,3
  UNION ALL
  SELECT
    'sale'::text,
    EXTRACT(DOW FROM (s.created_at AT TIME ZONE 'America/Sao_Paulo'))::integer,
    EXTRACT(HOUR FROM (s.created_at AT TIME ZONE 'America/Sao_Paulo'))::integer,
    COUNT(*)::bigint,
    COALESCE(SUM(s.gross_amount),0)
  FROM sales s
  WHERE s.sale_date BETWEEN p_start AND p_end
    AND (p_user_id IS NULL OR s.salesperson_id = p_user_id)
  GROUP BY 2,3;
END;
$$;

-- 5) Análise por vendedor
CREATE OR REPLACE FUNCTION public.get_salesperson_intel(
  p_start date,
  p_end date
)
RETURNS TABLE (
  salesperson_id uuid,
  salesperson_name text,
  proposals_count bigint,
  proposals_value numeric,
  sales_count bigint,
  sales_value numeric,
  matched_sales_count bigint,
  conversion_rate numeric,
  avg_days_to_convert numeric,
  avg_proposal_value numeric,
  avg_sale_value numeric,
  avg_discount_pct numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role text;
BEGIN
  SELECT role INTO caller_role FROM profiles WHERE id = auth.uid();
  IF caller_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  RETURN QUERY
  WITH props AS (
    SELECT user_id, COUNT(*) AS cnt, COALESCE(SUM(total_debt),0) AS val, AVG(total_debt) AS avg_val
    FROM proposals
    WHERE (created_at AT TIME ZONE 'America/Sao_Paulo')::date BETWEEN p_start AND p_end
    GROUP BY user_id
  ),
  sls AS (
    SELECT salesperson_id, COUNT(*) AS cnt, COALESCE(SUM(gross_amount),0) AS val, AVG(gross_amount) AS avg_val
    FROM sales
    WHERE sale_date BETWEEN p_start AND p_end
    GROUP BY salesperson_id
  ),
  conv AS (
    SELECT salesperson_id,
           COUNT(*) FILTER (WHERE proposal_id IS NOT NULL)::bigint AS matched,
           AVG(days_to_convert) FILTER (WHERE proposal_id IS NOT NULL) AS avg_days,
           AVG(
             CASE WHEN proposal_total_debt > 0 AND proposal_id IS NOT NULL
                  THEN (proposal_total_debt - sale_amount) / proposal_total_debt * 100
                  ELSE NULL END
           ) AS avg_disc
    FROM get_proposal_to_sale_conversion(p_start, p_end, NULL)
    GROUP BY salesperson_id
  )
  SELECT
    pr.id,
    pr.name,
    COALESCE(p.cnt,0)::bigint,
    COALESCE(p.val,0),
    COALESCE(s.cnt,0)::bigint,
    COALESCE(s.val,0),
    COALESCE(c.matched,0)::bigint,
    CASE WHEN COALESCE(p.cnt,0) = 0 THEN 0
         ELSE ROUND(COALESCE(c.matched,0)::numeric / p.cnt::numeric * 100, 2) END,
    ROUND(COALESCE(c.avg_days,0)::numeric, 2),
    ROUND(COALESCE(p.avg_val,0)::numeric, 2),
    ROUND(COALESCE(s.avg_val,0)::numeric, 2),
    ROUND(COALESCE(c.avg_disc,0)::numeric, 2)
  FROM profiles pr
  LEFT JOIN props p ON p.user_id = pr.id
  LEFT JOIN sls s ON s.salesperson_id = pr.id
  LEFT JOIN conv c ON c.salesperson_id = pr.id
  WHERE pr.role = 'vendedor'
    AND (COALESCE(p.cnt,0) > 0 OR COALESCE(s.cnt,0) > 0)
  ORDER BY COALESCE(s.val,0) DESC;
END;
$$;

-- 6) Distribuição de tempo de conversão (buckets)
CREATE OR REPLACE FUNCTION public.get_conversion_time_buckets(
  p_start date,
  p_end date,
  p_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  bucket text,
  bucket_order integer,
  count bigint,
  total_value numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role text;
BEGIN
  SELECT role INTO caller_role FROM profiles WHERE id = auth.uid();
  IF caller_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  RETURN QUERY
  WITH conv AS (
    SELECT * FROM get_proposal_to_sale_conversion(p_start, p_end, p_user_id)
    WHERE proposal_id IS NOT NULL
  ),
  bucketed AS (
    SELECT
      CASE
        WHEN days_to_convert = 0 THEN 'Mesmo dia'
        WHEN days_to_convert = 1 THEN '1 dia'
        WHEN days_to_convert BETWEEN 2 AND 3 THEN '2-3 dias'
        WHEN days_to_convert BETWEEN 4 AND 7 THEN '4-7 dias'
        WHEN days_to_convert BETWEEN 8 AND 15 THEN '8-15 dias'
        WHEN days_to_convert BETWEEN 16 AND 30 THEN '16-30 dias'
        ELSE '>30 dias'
      END AS bucket,
      CASE
        WHEN days_to_convert = 0 THEN 1
        WHEN days_to_convert = 1 THEN 2
        WHEN days_to_convert BETWEEN 2 AND 3 THEN 3
        WHEN days_to_convert BETWEEN 4 AND 7 THEN 4
        WHEN days_to_convert BETWEEN 8 AND 15 THEN 5
        WHEN days_to_convert BETWEEN 16 AND 30 THEN 6
        ELSE 7
      END AS bucket_order,
      sale_amount
    FROM conv
  )
  SELECT b.bucket, b.bucket_order, COUNT(*)::bigint, COALESCE(SUM(b.sale_amount),0)
  FROM bucketed b
  GROUP BY b.bucket, b.bucket_order
  ORDER BY b.bucket_order;
END;
$$;
