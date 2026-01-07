
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TeamDailySales {
  totalSales: number;
  totalAmount: number;
}

export function useTeamDailySales() {
  return useQuery({
    queryKey: ['team-daily-sales'],
    queryFn: async (): Promise<TeamDailySales> => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .rpc('get_team_daily_sales', { sale_date_param: today });

      if (error) {
        console.error("Error fetching team daily sales:", error);
        throw error;
      }

      const result = data?.[0] || { total_sales: 0, total_amount: 0 };
      
      return {
        totalSales: Number(result.total_sales) || 0,
        totalAmount: Number(result.total_amount) || 0
      };
    },
    staleTime: 30000, // Cache for 30 seconds
    refetchInterval: 60000 // Auto-refresh every 1 minute
  });
}
