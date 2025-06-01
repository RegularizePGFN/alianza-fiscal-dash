
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
        // Buscar vendas do mês/ano específico
        const { data: sales, error } = await supabase
          .from('sales')
          .select('*')
          .gte('sale_date', `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-01`)
          .lt('sale_date', `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}-01`)
          .order('sale_date', { ascending: false });

        if (error) throw error;

        if (sales && sales.length > 0) {
          const historyData = sales.map(sale => {
            const grossAmount = Number(sale.gross_amount);
            const commissionRate = grossAmount >= 10000 ? 25 : 20; // 25% se >= 10k, senão 20%
            const commissionAmount = grossAmount * (commissionRate / 100);

            return {
              id: sale.id,
              salespersonName: sale.salesperson_name || 'Vendedor',
              saleDate: sale.sale_date,
              clientName: sale.client_name,
              grossAmount,
              commissionRate,
              commissionAmount
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
