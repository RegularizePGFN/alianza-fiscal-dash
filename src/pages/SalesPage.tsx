
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SalesTable } from "@/components/sales/SalesTable";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileUp, FileDown } from "lucide-react";
import { Sale, UserRole, PaymentMethod } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { SaleFormModal } from "@/components/sales/SaleFormModal";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function SalesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [saleToDelete, setSaleToDelete] = useState<string | null>(null);
  
  // Fetch sales data from Supabase
  const fetchSales = async () => {
    try {
      setLoading(true);
      
      if (!user) return;
      
      let query = supabase
        .from('sales')
        .select('*, profiles(name)')
        .order('sale_date', { ascending: false });
      
      // Filter sales based on user role
      if (user.role === UserRole.SALESPERSON) {
        query = query.eq('salesperson_id', user.id);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      if (data) {
        const formattedSales: Sale[] = data.map((sale) => ({
          id: sale.id,
          salesperson_id: sale.salesperson_id,
          salesperson_name: sale.profiles?.name || 'Desconhecido',
          gross_amount: sale.gross_amount,
          net_amount: sale.gross_amount, // Using gross as net
          payment_method: sale.payment_method as PaymentMethod,
          installments: sale.installments,
          sale_date: sale.sale_date,
          created_at: sale.created_at,
          client_name: sale.client_name,
          client_phone: sale.client_phone,
          client_document: sale.client_document
        }));
        
        setSales(formattedSales);
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
      toast({
        title: "Erro ao carregar vendas",
        description: "Não foi possível carregar as vendas. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (user) {
      fetchSales();
    }
  }, [user]);
  
  const handleAddSale = () => {
    setEditingSale(null);
    setShowSaleModal(true);
  };
  
  const handleEdit = (sale: Sale) => {
    setEditingSale(sale);
    setShowSaleModal(true);
  };
  
  const handleDeleteConfirm = (saleId: string) => {
    setSaleToDelete(saleId);
  };
  
  const handleDeleteCancel = () => {
    setSaleToDelete(null);
  };
  
  const handleDeleteSale = async () => {
    if (!saleToDelete) return;
    
    try {
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', saleToDelete);
      
      if (error) {
        throw error;
      }
      
      setSales((prevSales) => prevSales.filter((sale) => sale.id !== saleToDelete));
      
      toast({
        title: "Venda excluída",
        description: "A venda foi excluída com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting sale:', error);
      toast({
        title: "Erro ao excluir venda",
        description: "Não foi possível excluir a venda. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
    
    setSaleToDelete(null);
  };
  
  const handleSaveSale = async (sale: Omit<Sale, 'id'>) => {
    try {
      if (editingSale) {
        // Update existing sale
        const { error } = await supabase
          .from('sales')
          .update({
            gross_amount: sale.gross_amount,
            payment_method: sale.payment_method,
            installments: sale.installments,
            sale_date: sale.sale_date,
            client_name: sale.client_name,
            client_phone: sale.client_phone,
            client_document: sale.client_document
          })
          .eq('id', editingSale.id);
        
        if (error) {
          throw error;
        }
        
        toast({
          title: "Venda atualizada",
          description: "A venda foi atualizada com sucesso.",
        });
      } else {
        // Add new sale
        const { data, error } = await supabase
          .from('sales')
          .insert({
            salesperson_id: sale.salesperson_id,
            gross_amount: sale.gross_amount,
            payment_method: sale.payment_method,
            installments: sale.installments,
            sale_date: sale.sale_date,
            client_name: sale.client_name,
            client_phone: sale.client_phone,
            client_document: sale.client_document
          })
          .select();
        
        if (error) {
          throw error;
        }
        
        toast({
          title: "Venda adicionada",
          description: "Nova venda registrada com sucesso.",
        });
      }
      
      // Refresh the sales list
      fetchSales();
    } catch (error: any) {
      console.error('Error saving sale:', error);
      toast({
        title: "Erro ao salvar venda",
        description: error.message || "Não foi possível salvar a venda. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
    
    setShowSaleModal(false);
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
            <Button onClick={handleAddSale}>
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
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <SalesTable
            sales={sales}
            showSalesperson={!isSalesperson}
            onEdit={handleEdit}
            onDelete={handleDeleteConfirm}
          />
        )}
        
        {showSaleModal && (
          <SaleFormModal 
            initialData={editingSale}
            onSave={handleSaveSale}
            onCancel={() => setShowSaleModal(false)}
          />
        )}
        
        <AlertDialog open={!!saleToDelete} onOpenChange={handleDeleteCancel}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir esta venda? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteSale} className="bg-destructive text-destructive-foreground">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
