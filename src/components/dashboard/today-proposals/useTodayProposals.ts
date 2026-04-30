import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TodayProposal {
  id: string;
  userId: string;
  userName: string;
  clientName: string;
  clientPhone: string | null;
  cnpj: string | null;
  totalDebt: number;
  discountedValue: number;
  discountPercentage: number;
  feesValue: number;
  createdAt: string;
}

interface UseTodayProposalsOptions {
  enabled: boolean;
  from?: Date;
  to?: Date;
}

export function useTodayProposals(options: UseTodayProposalsOptions | boolean) {
  // Backward compatibility: support boolean signature
  const opts: UseTodayProposalsOptions =
    typeof options === "boolean" ? { enabled: options } : options;

  const today = new Date();
  const defaultFrom = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const defaultTo = new Date(defaultFrom);
  defaultTo.setDate(defaultTo.getDate() + 1);

  const from = opts.from ?? defaultFrom;
  // `to` is exclusive end. If user passes a "day" Date, treat it as inclusive end-of-day.
  const to = opts.to ?? defaultTo;

  return useQuery({
    queryKey: ["today-proposals-admin", from.toISOString(), to.toISOString()],
    enabled: opts.enabled,
    staleTime: 30_000,
    refetchInterval: 60_000,
    queryFn: async (): Promise<TodayProposal[]> => {
      // Paginate to bypass Supabase's 1000-row default limit
      const PAGE_SIZE = 1000;
      let rows: any[] = [];
      let offset = 0;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from("proposals")
          .select(
            "id, user_id, client_name, client_phone, cnpj, total_debt, discounted_value, discount_percentage, fees_value, created_at"
          )
          .gte("created_at", from.toISOString())
          .lt("created_at", to.toISOString())
          .order("created_at", { ascending: false })
          .range(offset, offset + PAGE_SIZE - 1);

        if (error) throw error;

        const batch = data || [];
        rows = rows.concat(batch);
        hasMore = batch.length === PAGE_SIZE;
        offset += PAGE_SIZE;
      }

      const userIds = Array.from(new Set(rows.map((r) => r.user_id).filter(Boolean)));

      let userMap: Record<string, string> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, name")
          .in("id", userIds as string[]);
        userMap = (profiles || []).reduce((acc, p) => {
          acc[p.id] = p.name;
          return acc;
        }, {} as Record<string, string>);
      }

      return rows.map((r): TodayProposal => {
        const totalDebt = Number(r.total_debt) || 0;
        const discountedValue = Number(r.discounted_value) || 0;
        let feesValue = r.fees_value != null ? Number(r.fees_value) : 0;
        if (!feesValue && totalDebt && discountedValue) {
          feesValue = (totalDebt - discountedValue) * 0.2;
        }
        return {
          id: r.id,
          userId: r.user_id,
          userName: userMap[r.user_id] || "Desconhecido",
          clientName: r.client_name || "Cliente não informado",
          clientPhone: r.client_phone || null,
          cnpj: r.cnpj,
          totalDebt,
          discountedValue,
          discountPercentage: Number(r.discount_percentage) || 0,
          feesValue,
          createdAt: r.created_at,
        };
      });
    },
  });
}
