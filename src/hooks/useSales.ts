
import { useState, useEffect } from "react";
import { Sale, UserRole, PaymentMethod } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Mock sales data - temporary until database is properly set up
const mockSales: Sale[] = [
  {
    id: "1",
    salesperson_id: "3",
    salesperson_name: "Vendedor Silva",
    gross_amount: 5000,
    net_amount: 5000,
    payment_method: PaymentMethod.BOLETO,
    installments: 1,
    sale_date: "2025-04-20",
    created_at: "2025-04-20T14:30:00Z",
    client_name: "João Silva",
    client_phone: "+5521999999999",
    client_document: "123.456.789-00"
  },
  {
    id: "2",
    salesperson_id: "3",
    salesperson_name: "Vendedor Silva",
    gross_amount: 3500,
    net_amount: 3500,
    payment_method: PaymentMethod.PIX,
    installments: 1,
    sale_date: "2025-04-25",
    created_at: "2025-04-25T10:15:00Z",
    client_name: "Maria Oliveira",
    client_phone: "+5521888888888",
    client_document: "987.654.321-00"
  },
  {
    id: "3",
    salesperson_id: "4",
    salesperson_name: "Vendedor Santos",
    gross_amount: 7000,
    net_amount: 7000,
    payment_method: PaymentMethod.CREDIT,
    installments: 3,
    sale_date: "2025-04-28",
    created_at: "2025-04-28T16:45:00Z",
    client_name: "Empresa ABC Ltda",
    client_phone: "+5521777777777",
    client_document: "12.345.678/0001-90"
  },
];

export const useSales = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchSales = async () => {
    try {
      setLoading(true);
      
      if (!user) return;
      
      // Use mock data instead of Supabase query until database is set up
      const filteredSales = user.role === UserRole.SALESPERSON 
        ? mockSales.filter(sale => sale.salesperson_id === user.id)
        : mockSales;
      
      setSales(filteredSales);
      console.log("Using mock sales data until database is properly set up");
      
      // Commented out Supabase query until database is properly set up
      /*
      let query = supabase
        .from('sales')
        .select('*, profiles(name)')
        .order('sale_date', { ascending: false });
      
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
          net_amount: sale.gross_amount,
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
      */
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

  const handleDeleteSale = async (saleId: string) => {
    try {
      // Mock delete operation
      setSales((prevSales) => prevSales.filter((sale) => sale.id !== saleId));
      
      toast({
        title: "Venda excluída",
        description: "A venda foi excluída com sucesso.",
      });
      
      // Commented out Supabase operation
      /*
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', saleId);
      
      if (error) {
        throw error;
      }
      */
    } catch (error) {
      console.error('Error deleting sale:', error);
      toast({
        title: "Erro ao excluir venda",
        description: "Não foi possível excluir a venda. Tente novamente mais tarde.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };
  
  const handleSaveSale = async (saleData: Omit<Sale, 'id'>, editingSaleId?: string) => {
    try {
      if (editingSaleId) {
        // Mock update operation
        setSales(prevSales => 
          prevSales.map(sale => 
            sale.id === editingSaleId 
              ? { ...sale, ...saleData } 
              : sale
          )
        );
        
        toast({
          title: "Venda atualizada",
          description: "A venda foi atualizada com sucesso.",
        });
        
        // Commented out Supabase operation
        /*
        const { error } = await supabase
          .from('sales')
          .update({
            gross_amount: saleData.gross_amount,
            payment_method: saleData.payment_method,
            installments: saleData.installments,
            sale_date: saleData.sale_date,
            client_name: saleData.client_name,
            client_phone: saleData.client_phone,
            client_document: saleData.client_document
          })
          .eq('id', editingSaleId);
        
        if (error) {
          throw error;
        }
        */
      } else {
        // Mock add operation - generate a new ID
        const newId = `temp-${Date.now()}`;
        const newSale: Sale = {
          id: newId,
          ...saleData,
          created_at: new Date().toISOString(),
        };
        
        setSales(prevSales => [newSale, ...prevSales]);
        
        toast({
          title: "Venda adicionada",
          description: "Nova venda registrada com sucesso.",
        });
        
        // Commented out Supabase operation
        /*
        const { data, error } = await supabase
          .from('sales')
          .insert({
            salesperson_id: saleData.salesperson_id,
            gross_amount: saleData.gross_amount,
            payment_method: saleData.payment_method,
            installments: saleData.installments,
            sale_date: saleData.sale_date,
            client_name: saleData.client_name,
            client_phone: saleData.client_phone,
            client_document: saleData.client_document
          })
          .select();
        
        if (error) {
          throw error;
        }
        */
      }
      return true;
    } catch (error: any) {
      console.error('Error saving sale:', error);
      toast({
        title: "Erro ao salvar venda",
        description: error.message || "Não foi possível salvar a venda. Tente novamente mais tarde.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  useEffect(() => {
    if (user) {
      fetchSales();
    }
  }, [user]);
  
  return {
    sales,
    loading,
    fetchSales,
    handleDeleteSale,
    handleSaveSale
  };
};
