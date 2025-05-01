
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SalesTable } from "@/components/sales/SalesTable";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileUp, FileDown } from "lucide-react";
import { Sale, UserRole } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Mock sales data to use until we integrate with Supabase
const mockSales: Sale[] = [
  {
    id: "1",
    salesperson_id: "3",
    salesperson_name: "Vendedor Silva",
    gross_amount: 5000,
    net_amount: 4800,
    payment_method: "Boleto",
    installments: 1,
    sale_date: "2025-04-20",
  },
  {
    id: "2",
    salesperson_id: "3",
    salesperson_name: "Vendedor Silva",
    gross_amount: 3500,
    net_amount: 3300,
    payment_method: "Pix",
    installments: 1,
    sale_date: "2025-04-25",
  },
  {
    id: "3",
    salesperson_id: "4",
    salesperson_name: "Vendedor Santos",
    gross_amount: 7000,
    net_amount: 6500,
    payment_method: "Crédito",
    installments: 3,
    sale_date: "2025-04-28",
  },
  {
    id: "4",
    salesperson_id: "3",
    salesperson_name: "Vendedor Silva",
    gross_amount: 4200,
    net_amount: 4000,
    payment_method: "Boleto",
    installments: 1,
    sale_date: "2025-04-30",
  },
  {
    id: "5",
    salesperson_id: "4",
    salesperson_name: "Vendedor Santos",
    gross_amount: 8500,
    net_amount: 8000,
    payment_method: "Pix",
    installments: 1,
    sale_date: "2025-05-01",
  },
];

export default function SalesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sales, setSales] = useState<Sale[]>([]);
  
  useEffect(() => {
    // Filter sales based on user role
    if (user?.role === UserRole.SALESPERSON) {
      const filteredSales = mockSales.filter(sale => sale.salesperson_id === user.id);
      setSales(filteredSales);
    } else {
      setSales(mockSales);
    }
  }, [user]);
  
  const handleEdit = (sale: Sale) => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: `Editar venda: ${sale.id}`,
    });
  };
  
  const handleDelete = (saleId: string) => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: `Excluir venda: ${saleId}`,
    });
  };
  
  const isAdmin = user?.role === UserRole.ADMIN;
  const isManager = user?.role === UserRole.MANAGER;
  const isSalesperson = user?.role === UserRole.SALESPERSON;
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Vendas</h2>
            <p className="text-muted-foreground">
              Gerencie as vendas e comissões da equipe.
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova Venda
            </Button>
            
            {(isAdmin || isManager) && (
              <>
                <Button variant="outline">
                  <FileUp className="mr-2 h-4 w-4" />
                  Importar
                </Button>
                <Button variant="outline">
                  <FileDown className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
              </>
            )}
          </div>
        </div>
        
        <SalesTable
          sales={sales}
          showSalesperson={!isSalesperson}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </AppLayout>
  );
}
