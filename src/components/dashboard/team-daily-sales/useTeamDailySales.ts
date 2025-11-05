import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getTodayISO } from "@/lib/utils";

interface TeamDailySales {
  totalSales: number;
  totalAmount: number;
}

export const useTeamDailySales = () => {
  const [data, setData] = useState<TeamDailySales>({
    totalSales: 0,
    totalAmount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamDailySales = async () => {
      try {
        setLoading(true);
        const today = getTodayISO();

        // Usar RPC function para bypass RLS e obter dados agregados da equipe
        const { data: result, error } = await supabase
          .rpc('get_team_daily_sales', {
            sale_date_param: today
          });

        if (error) throw error;

        if (result && result.length > 0) {
          setData({
            totalSales: Number(result[0].total_sales),
            totalAmount: Number(result[0].total_amount),
          });
        }
      } catch (error) {
        console.error("Error fetching team daily sales:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamDailySales();
  }, []);

  return { ...data, loading };
};
