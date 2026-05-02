import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export interface IntelSummary {
  total_proposals: number;
  total_proposals_value: number;
  total_sales: number;
  total_sales_value: number;
  matched_sales: number;
  matched_sales_value: number;
  conversion_rate: number;
  avg_days_to_convert: number;
  median_days_to_convert: number;
  same_day_count: number;
}

export interface ConversionRow {
  sale_id: string;
  salesperson_id: string;
  salesperson_name: string;
  client_name: string;
  cnpj_normalized: string;
  sale_date: string;
  sale_amount: number;
  payment_method: string;
  proposal_id: string | null;
  proposal_created_at: string | null;
  proposal_total_debt: number | null;
  proposal_discounted_value: number | null;
  proposal_fees_value: number | null;
  days_to_convert: number | null;
}

export interface OpenProposalRow {
  proposal_id: string;
  salesperson_id: string;
  salesperson_name: string;
  client_name: string;
  client_phone: string | null;
  cnpj: string;
  total_debt: number;
  discounted_value: number;
  fees_value: number;
  created_at: string;
  aging_days: number;
}

export interface PatternRow {
  source: "proposal" | "sale";
  dow: number;
  hour: number;
  count: number;
  total_value: number;
}

export interface SalespersonIntelRow {
  salesperson_id: string;
  salesperson_name: string;
  proposals_count: number;
  proposals_value: number;
  sales_count: number;
  sales_value: number;
  matched_sales_count: number;
  conversion_rate: number;
  avg_days_to_convert: number;
  avg_proposal_value: number;
  avg_sale_value: number;
  avg_discount_pct: number;
}

export interface BucketRow {
  bucket: string;
  bucket_order: number;
  count: number;
  total_value: number;
}

interface Filters {
  start: Date;
  end: Date;
  userId: string | null;
  enabled?: boolean;
}

const fmt = (d: Date) => format(d, "yyyy-MM-dd");

export function useIntelSummary({ start, end, userId, enabled = true }: Filters) {
  return useQuery({
    queryKey: ["intel-summary", fmt(start), fmt(end), userId],
    enabled,
    staleTime: 60_000,
    queryFn: async (): Promise<IntelSummary> => {
      const { data, error } = await supabase.rpc("get_commercial_intel_summary", {
        p_start: fmt(start),
        p_end: fmt(end),
        p_user_id: userId,
      });
      if (error) throw error;
      const row = (data as any[])?.[0] || {};
      return {
        total_proposals: Number(row.total_proposals) || 0,
        total_proposals_value: Number(row.total_proposals_value) || 0,
        total_sales: Number(row.total_sales) || 0,
        total_sales_value: Number(row.total_sales_value) || 0,
        matched_sales: Number(row.matched_sales) || 0,
        matched_sales_value: Number(row.matched_sales_value) || 0,
        conversion_rate: Number(row.conversion_rate) || 0,
        avg_days_to_convert: Number(row.avg_days_to_convert) || 0,
        median_days_to_convert: Number(row.median_days_to_convert) || 0,
        same_day_count: Number(row.same_day_count) || 0,
      };
    },
  });
}

export function useConversionRows({ start, end, userId, enabled = true }: Filters) {
  return useQuery({
    queryKey: ["intel-conversions", fmt(start), fmt(end), userId],
    enabled,
    staleTime: 60_000,
    queryFn: async (): Promise<ConversionRow[]> => {
      const { data, error } = await supabase.rpc("get_proposal_to_sale_conversion", {
        p_start: fmt(start),
        p_end: fmt(end),
        p_user_id: userId,
      });
      if (error) throw error;
      return ((data as any[]) || []).map((r) => ({
        ...r,
        sale_amount: Number(r.sale_amount) || 0,
        proposal_total_debt: r.proposal_total_debt != null ? Number(r.proposal_total_debt) : null,
        proposal_discounted_value:
          r.proposal_discounted_value != null ? Number(r.proposal_discounted_value) : null,
        proposal_fees_value:
          r.proposal_fees_value != null ? Number(r.proposal_fees_value) : null,
        days_to_convert: r.days_to_convert != null ? Number(r.days_to_convert) : null,
      }));
    },
  });
}

export function useOpenProposals({ start, end, userId, enabled = true }: Filters) {
  return useQuery({
    queryKey: ["intel-open-proposals", fmt(start), fmt(end), userId],
    enabled,
    staleTime: 60_000,
    queryFn: async (): Promise<OpenProposalRow[]> => {
      const { data, error } = await supabase.rpc("get_open_proposals", {
        p_start: fmt(start),
        p_end: fmt(end),
        p_user_id: userId,
      });
      if (error) throw error;
      return ((data as any[]) || []).map((r) => ({
        ...r,
        total_debt: Number(r.total_debt) || 0,
        discounted_value: Number(r.discounted_value) || 0,
        fees_value: Number(r.fees_value) || 0,
        aging_days: Number(r.aging_days) || 0,
      }));
    },
  });
}

export function useHourlyPatterns({ start, end, userId, enabled = true }: Filters) {
  return useQuery({
    queryKey: ["intel-patterns", fmt(start), fmt(end), userId],
    enabled,
    staleTime: 60_000,
    queryFn: async (): Promise<PatternRow[]> => {
      const { data, error } = await supabase.rpc("get_hourly_patterns", {
        p_start: fmt(start),
        p_end: fmt(end),
        p_user_id: userId,
      });
      if (error) throw error;
      return ((data as any[]) || []).map((r) => ({
        source: r.source,
        dow: Number(r.dow) || 0,
        hour: Number(r.hour) || 0,
        count: Number(r.count) || 0,
        total_value: Number(r.total_value) || 0,
      }));
    },
  });
}

export function useSalespersonIntel({
  start,
  end,
  enabled = true,
}: Omit<Filters, "userId">) {
  return useQuery({
    queryKey: ["intel-salesperson", fmt(start), fmt(end)],
    enabled,
    staleTime: 60_000,
    queryFn: async (): Promise<SalespersonIntelRow[]> => {
      const { data, error } = await supabase.rpc("get_salesperson_intel", {
        p_start: fmt(start),
        p_end: fmt(end),
      });
      if (error) throw error;
      return ((data as any[]) || []).map((r) => ({
        ...r,
        proposals_count: Number(r.proposals_count) || 0,
        proposals_value: Number(r.proposals_value) || 0,
        sales_count: Number(r.sales_count) || 0,
        sales_value: Number(r.sales_value) || 0,
        matched_sales_count: Number(r.matched_sales_count) || 0,
        conversion_rate: Number(r.conversion_rate) || 0,
        avg_days_to_convert: Number(r.avg_days_to_convert) || 0,
        avg_proposal_value: Number(r.avg_proposal_value) || 0,
        avg_sale_value: Number(r.avg_sale_value) || 0,
        avg_discount_pct: Number(r.avg_discount_pct) || 0,
      }));
    },
  });
}

export function useConversionBuckets({ start, end, userId, enabled = true }: Filters) {
  return useQuery({
    queryKey: ["intel-buckets", fmt(start), fmt(end), userId],
    enabled,
    staleTime: 60_000,
    queryFn: async (): Promise<BucketRow[]> => {
      const { data, error } = await supabase.rpc("get_conversion_time_buckets", {
        p_start: fmt(start),
        p_end: fmt(end),
        p_user_id: userId,
      });
      if (error) throw error;
      return ((data as any[]) || []).map((r) => ({
        bucket: r.bucket,
        bucket_order: Number(r.bucket_order) || 0,
        count: Number(r.count) || 0,
        total_value: Number(r.total_value) || 0,
      }));
    },
  });
}
