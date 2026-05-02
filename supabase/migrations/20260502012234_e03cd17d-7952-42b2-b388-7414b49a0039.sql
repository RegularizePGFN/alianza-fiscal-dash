
REVOKE EXECUTE ON FUNCTION public.get_proposal_to_sale_conversion(date, date, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_commercial_intel_summary(date, date, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_open_proposals(date, date, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_hourly_patterns(date, date, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_salesperson_intel(date, date) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_conversion_time_buckets(date, date, uuid) FROM anon, public;

GRANT EXECUTE ON FUNCTION public.get_proposal_to_sale_conversion(date, date, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_commercial_intel_summary(date, date, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_open_proposals(date, date, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_hourly_patterns(date, date, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_salesperson_intel(date, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_conversion_time_buckets(date, date, uuid) TO authenticated;
