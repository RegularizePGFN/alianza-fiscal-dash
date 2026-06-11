
CREATE OR REPLACE FUNCTION public.get_proposals_history_summary(
  p_from timestamptz,
  p_to timestamptz,
  p_user_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role text;
  caller_id uuid;
  effective_user_id uuid;
  sees_all boolean;
  result jsonb;
BEGIN
  caller_id := auth.uid();
  SELECT role INTO caller_role FROM profiles WHERE id = caller_id;
  sees_all := caller_role IN ('admin', 'backoffice', 'gestor');

  -- Non-admins are forced to their own data, regardless of p_user_id
  IF sees_all THEN
    effective_user_id := p_user_id; -- may be NULL (= all)
  ELSE
    effective_user_id := caller_id;
  END IF;

  WITH base AS (
    SELECT
      p.id,
      p.user_id,
      p.created_at,
      COALESCE(p.total_debt, 0)         AS total_debt,
      COALESCE(p.discounted_value, 0)   AS discounted_value,
      COALESCE(p.discount_percentage,0) AS discount_percentage,
      COALESCE(
        p.fees_value,
        GREATEST(COALESCE(p.total_debt,0) - COALESCE(p.discounted_value,0), 0) * 0.2
      ) AS fees_value
    FROM proposals p
    WHERE p.created_at >= p_from
      AND p.created_at <  p_to
      AND (effective_user_id IS NULL OR p.user_id = effective_user_id)
  ),
  kpis AS (
    SELECT
      COUNT(*)::bigint                            AS total_count,
      COALESCE(SUM(total_debt), 0)                AS total_consolidated,
      COALESCE(SUM(discounted_value), 0)          AS total_discounted,
      COALESCE(SUM(fees_value), 0)                AS total_fees,
      ROUND(COALESCE(AVG(discount_percentage),0)::numeric, 2) AS avg_discount
    FROM base
  ),
  daily AS (
    SELECT
      ((created_at AT TIME ZONE 'America/Sao_Paulo')::date) AS day,
      COUNT(*)::bigint AS count,
      COALESCE(SUM(fees_value), 0) AS fees
    FROM base
    GROUP BY 1
    ORDER BY 1
  ),
  by_seller AS (
    SELECT
      b.user_id,
      COALESCE(pr.name, 'Desconhecido') AS name,
      COUNT(*)::bigint AS count,
      COALESCE(SUM(b.fees_value), 0)   AS fees,
      COALESCE(SUM(b.total_debt), 0)   AS consolidated
    FROM base b
    LEFT JOIN profiles pr ON pr.id = b.user_id
    GROUP BY b.user_id, pr.name
    ORDER BY count DESC
  )
  SELECT jsonb_build_object(
    'kpis', (SELECT to_jsonb(k) FROM kpis k),
    'daily', COALESCE((SELECT jsonb_agg(jsonb_build_object('date', day, 'count', count, 'fees', fees)) FROM daily), '[]'::jsonb),
    'by_seller', COALESCE((SELECT jsonb_agg(jsonb_build_object('user_id', user_id, 'name', name, 'count', count, 'fees', fees, 'consolidated', consolidated)) FROM by_seller), '[]'::jsonb),
    'sees_all', sees_all
  )
  INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_proposals_history_summary(timestamptz, timestamptz, uuid) TO authenticated;
