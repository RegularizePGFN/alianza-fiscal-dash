
import { useState, useEffect } from 'react';
import { SalespeopleCommissionsData } from './types';
import { DateFilter, PaymentMethod } from '@/lib/types';
import { useSales } from '@/hooks/sales';
import { useUsers } from '@/hooks/useUsers';
import { calculateCommissionValue } from './utils';

export const useSalespeopleCommissions = (
  selectedMonth: string,
  externalFilters?: {
    salespersonId: string | null;
    paymentMethod: PaymentMethod | null;
    dateFilter: DateFilter | null;
  }
) => {
  const [data, setData] = useState<SalespeopleCommissionsData>({
    salespeople: [],
    totals: {
      totalSales: 0,
      totalValue: 0,
      totalCommission: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { sales, loading: salesLoading } = useSales();
  const { users, isLoading: usersLoading } = useUsers();

  useEffect(() => {
    if (salesLoading || usersLoading) {
      setLoading(true);
      return;
    }

    try {
      console.log('useSalespeopleCommissions - Processing data with filters:', {
        selectedMonth,
        externalFilters,
        totalSales: sales.length
      });

      // Filter sales data
      let filteredSales = sales.filter(sale => {
        // Month filter (always applied)
        const saleMonth = sale.sale_date.substring(0, 7); // YYYY-MM format
        const monthMatch = saleMonth === selectedMonth;
        
        if (!monthMatch) return false;

        // External filters
        if (externalFilters) {
          // Salesperson filter
          if (externalFilters.salespersonId && sale.salesperson_id !== externalFilters.salespersonId) {
            return false;
          }

          // Payment method filter
          if (externalFilters.paymentMethod && sale.payment_method !== externalFilters.paymentMethod) {
            return false;
          }

          // Date range filter (more specific than month)
          if (externalFilters.dateFilter?.startDate && externalFilters.dateFilter?.endDate) {
            const startDate = externalFilters.dateFilter.startDate instanceof Date ? 
              externalFilters.dateFilter.startDate.toISOString().split('T')[0] : 
              externalFilters.dateFilter.startDate;
            
            const endDate = externalFilters.dateFilter.endDate instanceof Date ? 
              externalFilters.dateFilter.endDate.toISOString().split('T')[0] : 
              externalFilters.dateFilter.endDate;
            
            if (sale.sale_date < startDate || sale.sale_date > endDate) {
              return false;
            }
          }
        }

        return true;
      });

      console.log('useSalespeopleCommissions - Filtered sales:', filteredSales.length);

      // Group by salesperson
      const salesBySalesperson = filteredSales.reduce((acc, sale) => {
        const salespersonId = sale.salesperson_id;
        if (!acc[salespersonId]) {
          acc[salespersonId] = [];
        }
        acc[salespersonId].push(sale);
        return acc;
      }, {} as Record<string, typeof filteredSales>);

      // Process data for each salesperson
      const salespeopleData = Object.entries(salesBySalesperson).map(([salespersonId, salesData]) => {
        const user = users.find(u => u.id === salespersonId);
        const totalSales = salesData.length;
        const totalValue = salesData.reduce((sum, sale) => sum + sale.gross_amount, 0);
        const totalCommission = salesData.reduce((sum, sale) => sum + calculateCommissionValue(sale), 0);

        return {
          id: salespersonId,
          name: user?.name || 'Vendedor não encontrado',
          totalSales,
          totalValue,
          totalCommission
        };
      });

      // Calculate totals
      const totals = {
        totalSales: salespeopleData.reduce((sum, sp) => sum + sp.totalSales, 0),
        totalValue: salespeopleData.reduce((sum, sp) => sum + sp.totalValue, 0),
        totalCommission: salespeopleData.reduce((sum, sp) => sum + sp.totalCommission, 0)
      };

      setData({
        salespeople: salespeopleData,
        totals
      });

      console.log('useSalespeopleCommissions - Final data:', {
        salespeopleCount: salespeopleData.length,
        totals
      });

    } catch (err) {
      console.error('useSalespeopleCommissions - Error processing data:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [sales, users, selectedMonth, salesLoading, usersLoading, externalFilters]);

  return { data, loading, error };
};
