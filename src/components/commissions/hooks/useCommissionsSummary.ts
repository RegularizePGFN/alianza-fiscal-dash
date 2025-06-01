
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

interface CommissionsSummary {
  totalSales: number;
  totalGross: number;
  totalCommission: number;
  totalSalespeople: number;
}

export const useCommissionsSummary = (selectedMonth: number, selectedYear: number) => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<CommissionsSummary>({
    totalSales: 0,
    totalGross: 0,
    totalCommission: 0,
    totalSalespeople: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!user) return;
      
      setLoading(true);
      
      try {
        // Buscar vendas do mês/ano específico
        const { data: sales, error } = await supabase
          .from('sales')
          .select('*')
          .gte('sale_date', `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-01`)
          .lt('sale_date', `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}-01`);

        if (error) throw error;

        if (sales && sales.length > 0) {
          const totalGross = sales.reduce((sum, sale) => sum + Number(sale.gross_amount), 0);
          const uniqueSalespeople = new Set(sales.map(sale => sale.salesperson_id)).size;
          
          // Calcular comissões usando a mesma lógica existente
          const totalCommission = sales.reduce((sum, sale) => {
            const grossAmount = Number(sale.gross_amount);
            const rate = grossAmount >= 10000 ? 0.25 : 0.20; // 25% se >= 10k, senão 20%
            return sum + (grossAmount * rate);
          }, 0);

          setSummary({
            totalSales: sales.length,
            totalGross,
            totalCommission,
            totalSalespeople: uniqueSalespeople
          });
        } else {
          setSummary({
            totalSales: 0,
            totalGross: 0,
            totalCommission: 0,
            totalSalespeople: 0
          });
        }
      } catch (error) {
        console.error('Error fetching commissions summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [user, selectedMonth, selectedYear]);

  return { summary, loading };
};
