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

        const { data: teamSales, error } = await supabase
          .from("sales")
          .select("gross_amount")
          .eq("sale_date", today);

        if (error) throw error;

        if (teamSales) {
          const totalAmount = teamSales.reduce(
            (sum, sale) => sum + Number(sale.gross_amount),
            0
          );

          setData({
            totalSales: teamSales.length,
            totalAmount,
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
