
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
          const uniqueSalespeople = new Set(sales.map(sale => sale.salesperson_id));
          
          // Calcular comissões por vendedor usando a lógica correta:
          // 25% se o total do vendedor no mês >= 10.000, senão 20%
          let totalCommission = 0;
          
          uniqueSalespeople.forEach(salespersonId => {
            const personSales = sales.filter(sale => sale.salesperson_id === salespersonId);
            const personTotal = personSales.reduce((sum, sale) => sum + Number(sale.gross_amount), 0);
            
            if (personTotal >= 10000) {
              totalCommission += personTotal * 0.25; // 25% no total
            } else {
              totalCommission += personTotal * 0.20; // 20% no total
            }
          });

          setSummary({
            totalSales: sales.length,
            totalGross,
            totalCommission,
            totalSalespeople: uniqueSalespeople.size
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
