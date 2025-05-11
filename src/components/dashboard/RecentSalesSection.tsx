
import { PaginatedSalesTable } from "@/components/sales/PaginatedSalesTable";
import { Sale, UserRole } from "@/lib/types";
import { useAuth } from "@/contexts/auth";

interface RecentSalesSectionProps {
  salesData: Sale[];
}

export function RecentSalesSection({ salesData }: RecentSalesSectionProps) {
  const { user } = useAuth();
  
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Últimas Vendas</h3>
      <PaginatedSalesTable 
        sales={salesData} 
        showSalesperson={user?.role !== UserRole.SALESPERSON}
        itemsPerPage={5}  // Show fewer items on dashboard
      />
    </div>
  );
}
