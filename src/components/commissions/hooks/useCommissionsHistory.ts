
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

interface CommissionHistoryItem {
  id: string;
  salespersonName: string;
  saleDate: string;
  clientName: string;
  grossAmount: number;
  commissionRate: number;
  commissionAmount: number;
  monthlyTotal: number; // Total do vendedor no mês para determinar a taxa
}

export const useCommissionsHistory = (selectedMonth: number, selectedYear: number) => {
  const { user } = useAuth();
  const [history, setHistory] = useState<CommissionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      
      setLoading(true);
      
      try {
        const startDate = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-01`;
        const endDate = `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}-01`;
        
        // Buscar vendas do mês/ano específico
        const { data: sales, error } = await supabase
          .from('sales')
          .select('*')
          .gte('sale_date', startDate)
          .lt('sale_date', endDate)
          .order('sale_date', { ascending: false });

        if (error) throw error;

        if (sales && sales.length > 0) {
          // Calcular totais mensais por vendedor
          const salespersonTotals = new Map<string, number>();
          
          sales.forEach(sale => {
            const current = salespersonTotals.get(sale.salesperson_id) || 0;
            salespersonTotals.set(sale.salesperson_id, current + Number(sale.gross_amount));
          });

          const historyData = sales.map(sale => {
            const grossAmount = Number(sale.gross_amount);
            const monthlyTotal = salespersonTotals.get(sale.salesperson_id) || 0;
            
            // Determinar taxa baseada no total mensal do vendedor
            const commissionRate = monthlyTotal >= 10000 ? 25 : 20;
            
            // Calcular comissão proporcional desta venda
            const commissionAmount = grossAmount * (commissionRate / 100);

            return {
              id: sale.id,
              salespersonName: sale.salesperson_name || 'Vendedor',
              saleDate: sale.sale_date,
              clientName: sale.client_name,
              grossAmount,
              commissionRate,
              commissionAmount,
              monthlyTotal
            };
          });

          setHistory(historyData);
        } else {
          setHistory([]);
        }
      } catch (error) {
        console.error('Error fetching commissions history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user, selectedMonth, selectedYear]);

  return { history, loading };
};
