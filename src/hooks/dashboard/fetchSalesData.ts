
import { supabase } from "@/integrations/supabase/client";
import { Sale, UserRole } from "@/lib/types";
import { convertToPaymentMethod } from "@/lib/utils";

/**
 * Fetches sales data for the specified date range
 */
export const fetchSalesData = async (
  user: { id: string; role: UserRole } | null,
  currentStartStr: string,
  currentEndStr: string
) => {
  if (!user) return [];

  // Fetch current month sales
  const { data: salesData, error } = await supabase
    .from("sales")
    .select("*")
    .gte("sale_date", currentStartStr)
    .lte("sale_date", currentEndStr)
    .order("sale_date", { ascending: false });

  if (error) {
    console.error("Erro ao buscar dados:", error);
    throw error;
  }

  console.log("Dados recebidos do Supabase (mês atual):", salesData?.length || 0, "registros");
  
  if (salesData && salesData.length > 0) {
    // Log a amostra de datas para depuração
    console.log("Amostra de datas de vendas do banco de dados (primeiros 3 registros):");
    salesData.slice(0, 3).forEach((sale, i) => {
      console.log(`Venda ${i+1}: ID=${sale.id}, Data=${sale.sale_date}, Tipo=${typeof sale.sale_date}`);
    });
  }

  // Filter data client-side if needed
  let filteredCurrentData = salesData || [];
  if (user.role === UserRole.SALESPERSON) {
    filteredCurrentData = filteredCurrentData.filter((sale) => sale.salesperson_id === user.id);
    console.log("Dados filtrados para vendedor (mês atual):", filteredCurrentData.length, "registros");
  }

  // Map data to Sale interface
  const formattedSales: Sale[] = filteredCurrentData.map((sale) => {
    // Preservar exatamente a string da data como está no banco de dados
    // Isso é crucial para comparações posteriores
    const saleDate = sale.sale_date;
    
    return {
      id: sale.id,
      salesperson_id: sale.salesperson_id,
      salesperson_name: sale.salesperson_name || "Sem nome",
      gross_amount: Number(sale.gross_amount),
      net_amount: Number(sale.gross_amount), // Using gross_amount as net_amount
      payment_method: convertToPaymentMethod(sale.payment_method),
      installments: sale.installments || 1,
      sale_date: saleDate,
      created_at: sale.created_at,
      client_name: sale.client_name || "Cliente não identificado",
      client_phone: sale.client_phone || "",
      client_document: sale.client_document || "",
    };
  });

  return formattedSales;
};

/**
 * Fetches sales data for the previous month
 */
export const fetchPreviousMonthSales = async (
  user: { id: string; role: UserRole } | null,
  prevStartStr: string,
  prevEndStr: string
) => {
  if (!user) return [];

  const { data: prevMonthData, error: prevMonthError } = await supabase
    .from("sales")
    .select("*")
    .gte("sale_date", prevStartStr)
    .lte("sale_date", prevEndStr);

  if (prevMonthError) {
    console.error("Erro ao buscar dados do mês anterior:", prevMonthError);
    throw prevMonthError;
  }

  console.log("Dados recebidos do Supabase (mês anterior):", prevMonthData?.length || 0, "registros");

  let filteredPrevData = prevMonthData || [];
  if (user.role === UserRole.SALESPERSON) {
    filteredPrevData = filteredPrevData.filter((sale) => sale.salesperson_id === user.id);
    console.log("Dados filtrados para vendedor (mês anterior):", filteredPrevData.length, "registros");
  }

  // Map data properly to include net_amount
  const formattedSales: Sale[] = filteredPrevData.map((sale) => {
    // Preservar exatamente a string da data como está no banco de dados
    const saleDate = sale.sale_date;
    
    return {
      id: sale.id,
      salesperson_id: sale.salesperson_id,
      salesperson_name: sale.salesperson_name || "Sem nome",
      gross_amount: Number(sale.gross_amount),
      net_amount: Number(sale.gross_amount), // Using gross_amount as net_amount
      payment_method: convertToPaymentMethod(sale.payment_method),
      installments: sale.installments || 1,
      sale_date: saleDate,
      created_at: sale.created_at,
      client_name: sale.client_name || "Cliente não identificado",
      client_phone: sale.client_phone || "",
      client_document: sale.client_document || "",
    };
  });

  return formattedSales;
};
