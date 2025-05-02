
import { useState, useEffect } from "react";
import { Sale, UserRole, PaymentMethod } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Função auxiliar para converter string para o enum PaymentMethod
const convertToPaymentMethod = (method: string): PaymentMethod => {
  switch (method) {
    case "Boleto":
      return PaymentMethod.BOLETO;
    case "Pix":
      return PaymentMethod.PIX;
    case "Crédito":
      return PaymentMethod.CREDIT;
    case "Débito":
      return PaymentMethod.DEBIT;
    default:
      return PaymentMethod.CREDIT; // Valor padrão
  }
};

export const useSales = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchSales = async () => {
    try {
      setLoading(true);
      
      if (!user) return;
      
      console.log("Fetching sales for user:", user.id, "with role:", user.role);
      
      // Simplified query - avoid complex RLS policies by making the client do the filtering
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('sale_date', { ascending: false });
      
      if (error) {
        console.error("Supabase query error:", error);
        throw error;
      }
      
      if (data) {
        console.log("Sales data fetched:", data.length, "records");
        
        // Client-side filtering based on user role
        let filteredData = data;
        if (user.role === UserRole.SALESPERSON) {
          filteredData = data.filter(sale => sale.salesperson_id === user.id);
        }
        
        // Mapear os dados e garantir que todos os campos necessários estejam presentes
        const formattedSales: Sale[] = filteredData.map((sale) => ({
          id: sale.id,
          salesperson_id: sale.salesperson_id,
          salesperson_name: sale.salesperson_name || 'Desconhecido',
          gross_amount: sale.gross_amount,
          net_amount: sale.gross_amount, // Usar o gross_amount como net_amount
          payment_method: convertToPaymentMethod(sale.payment_method),
          installments: sale.installments,
          sale_date: sale.sale_date,
          created_at: sale.created_at,
          client_name: sale.client_name,
          client_phone: sale.client_phone,
          client_document: sale.client_document
        }));
        
        setSales(formattedSales);
      }
    } catch (error: any) {
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
      console.log("Deleting sale:", saleId);
      
      // Simplify the delete operation
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', saleId);
      
      if (error) {
        console.error("Delete error:", error);
        throw error;
      }
      
      console.log("Sale deleted successfully");
      
      // Atualizar a lista local após a exclusão bem-sucedida
      setSales((prevSales) => prevSales.filter((sale) => sale.id !== saleId));
      
      toast({
        title: "Venda excluída",
        description: "A venda foi excluída com sucesso.",
      });
      
      return true;
    } catch (error: any) {
      console.error('Error deleting sale:', error);
      toast({
        title: "Erro ao excluir venda",
        description: error.message || "Não foi possível excluir a venda. Tente novamente mais tarde.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  const handleSaveSale = async (saleData: Omit<Sale, 'id'>, editingSaleId?: string) => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para registrar uma venda.",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      console.log("Saving sale:", editingSaleId ? "Editing" : "New", saleData);
      
      // Preparar o objeto para o Supabase (converter PaymentMethod enum para string)
      const supabaseData = {
        salesperson_id: saleData.salesperson_id,
        salesperson_name: saleData.salesperson_name,
        gross_amount: saleData.gross_amount,
        payment_method: saleData.payment_method.toString(),
        installments: saleData.installments,
        sale_date: saleData.sale_date,
        client_name: saleData.client_name,
        client_phone: saleData.client_phone,
        client_document: saleData.client_document
      };
      
      if (editingSaleId) {
        // Atualizar venda existente
        const { data, error } = await supabase
          .from('sales')
          .update(supabaseData)
          .eq('id', editingSaleId)
          .select();
        
        if (error) {
          console.error("Update error:", error);
          throw error;
        }
        
        console.log("Sale updated successfully:", data);
        
        if (data && data.length > 0) {
          // Atualizar a lista local
          setSales(prevSales => 
            prevSales.map(sale => 
              sale.id === editingSaleId 
                ? { 
                    ...sale, 
                    ...saleData, 
                    id: editingSaleId 
                  } 
                : sale
            )
          );
          
          toast({
            title: "Venda atualizada",
            description: "A venda foi atualizada com sucesso.",
          });
        }
      } else {
        // Inserir nova venda
        const { data, error } = await supabase
          .from('sales')
          .insert(supabaseData)
          .select();
        
        if (error) {
          console.error("Insert error:", error);
          throw error;
        }
        
        console.log("Sale inserted successfully:", data);
        
        if (data && data.length > 0) {
          // Adicionar à lista local
          const newSale: Sale = {
            id: data[0].id,
            salesperson_id: data[0].salesperson_id,
            salesperson_name: data[0].salesperson_name,
            gross_amount: data[0].gross_amount,
            net_amount: data[0].gross_amount,  // Usando o gross_amount como net_amount
            payment_method: saleData.payment_method,  // Mantém o enum
            installments: data[0].installments,
            sale_date: data[0].sale_date,
            created_at: data[0].created_at,
            client_name: data[0].client_name,
            client_phone: data[0].client_phone,
            client_document: data[0].client_document
          };
          
          setSales(prevSales => [newSale, ...prevSales]);
          
          toast({
            title: "Venda adicionada",
            description: "Nova venda registrada com sucesso.",
          });
        }
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
      console.log("User authenticated, fetching sales");
      fetchSales();
    } else {
      console.log("No user authenticated, skipping sales fetch");
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
