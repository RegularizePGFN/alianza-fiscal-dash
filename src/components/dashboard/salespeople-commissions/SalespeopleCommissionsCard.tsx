
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHeader } from "@/components/ui/table";
import { TableHeader as CustomTableHeader } from "./TableHeader";
import { SalespersonRow } from "./SalespersonRow";
import { SummaryRow } from "./SummaryRow";
import { useSalespeopleCommissions } from "./useSalespeopleCommissions";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { DateFilter, PaymentMethod } from "@/lib/types";

interface SalespeopleCommissionsCardProps {
  selectedMonth: string;
  externalFilters?: {
    salespersonId: string | null;
    paymentMethod: PaymentMethod | null;
    dateFilter: DateFilter | null;
  };
}

export function SalespeopleCommissionsCard({ selectedMonth, externalFilters }: SalespeopleCommissionsCardProps) {
  const [sortBy, setSortBy] = useState<'name' | 'sales' | 'commission' | 'value'>('value');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const { data, loading, error } = useSalespeopleCommissions(selectedMonth, externalFilters);

  const handleSort = (field: 'name' | 'sales' | 'commission' | 'value') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Consolidado Vendedores</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-32">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Consolidado Vendedores</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Erro ao carregar dados: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  // Sort data based on current sort settings
  const sortedData = [...data.salespeople].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'sales':
        aValue = a.totalSales;
        bValue = b.totalSales;
        break;
      case 'commission':
        aValue = a.totalCommission;
        bValue = b.totalCommission;
        break;
      case 'value':
        aValue = a.totalValue;
        bValue = b.totalValue;
        break;
      default:
        return 0;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue);
      return sortOrder === 'asc' ? comparison : -comparison;
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <CustomTableHeader 
                onSort={handleSort}
                sortBy={sortBy}
                sortOrder={sortOrder}
              />
            </TableHeader>
            <TableBody>
              {sortedData.map((salesperson) => (
                <SalespersonRow 
                  key={salesperson.id} 
                  person={{
                    id: salesperson.id,
                    name: salesperson.name,
                    totalSales: salesperson.totalSales,
                    goalAmount: 0,
                    commissionGoalAmount: 0,
                    projectedCommission: salesperson.totalCommission,
                    goalPercentage: 0,
                    salesCount: salesperson.totalSales,
                    metaGap: 0,
                    expectedProgress: 0,
                    remainingDailyTarget: 0,
                    zeroDaysCount: 0
                  }} 
                />
              ))}
              <SummaryRow summaryTotals={{
                salesCount: data.totals.totalSales,
                totalSales: data.totals.totalValue,
                goalAmount: 0,
                commissionGoalAmount: 0,
                goalPercentage: 0,
                metaGap: 0,
                remainingDailyTarget: 0,
                projectedCommission: data.totals.totalCommission,
                zeroDaysCount: 0
              }} />
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
