import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TodayProposal {
  id: string;
  userId: string;
  userName: string;
  clientName: string;
  cnpj: string | null;
  totalDebt: number;
  discountedValue: number;
  discountPercentage: number;
  feesValue: number;
  createdAt: string;
}

export function useTodayProposals(enabled: boolean) {
  return useQuery({
    queryKey: ["today-proposals-admin"],
    enabled,
    staleTime: 30_000,
    refetchInterval: 60_000,
    queryFn: async (): Promise<TodayProposal[]> => {
      // Compute today's range in local time (server is GMT-3 / America/Sao_Paulo)
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const end = new Date(start);
      end.setDate(end.getDate() + 1);

      const { data, error } = await supabase
        .from("proposals")
        .select(
          "id, user_id, client_name, cnpj, total_debt, discounted_value, discount_percentage, fees_value, created_at"
        )
        .gte("created_at", start.toISOString())
        .lt("created_at", end.toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;

      const rows = data || [];
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
