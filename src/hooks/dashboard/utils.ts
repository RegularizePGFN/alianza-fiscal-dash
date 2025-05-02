
import { PaymentMethod } from "@/lib/types";

// Helper function to convert string to PaymentMethod enum
export const convertToPaymentMethod = (method: string): PaymentMethod => {
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
      return PaymentMethod.CREDIT; // Default value
  }
};

// Helper function to calculate trends
export const calculateTrends = (
  filteredCurrentData: any[], 
  filteredPrevData: any[]
) => {
  let totalSalesTrend = { value: 0, isPositive: true };
  let averageSaleTrend = { value: 0, isPositive: true };
  
  const currentTotalAmount = filteredCurrentData.reduce((sum, sale) => sum + sale.gross_amount, 0);
  const prevTotalAmount = filteredPrevData.reduce((sum, sale) => sum + sale.gross_amount, 0);
  
  const currentAvgAmount = filteredCurrentData.length > 0 
    ? currentTotalAmount / filteredCurrentData.length 
    : 0;
    
  const prevAvgAmount = filteredPrevData.length > 0 
    ? prevTotalAmount / filteredPrevData.length 
    : 0;
  
  // Calculate percentage changes
  if (prevTotalAmount > 0) {
    const totalChange = ((currentTotalAmount - prevTotalAmount) / prevTotalAmount) * 100;
    totalSalesTrend = {
      value: Math.abs(Math.round(totalChange)),
      isPositive: totalChange >= 0
    };
  }
  
  if (prevAvgAmount > 0) {
    const avgChange = ((currentAvgAmount - prevAvgAmount) / prevAvgAmount) * 100;
    averageSaleTrend = {
      value: Math.abs(Math.round(avgChange)),
      isPositive: avgChange >= 0
    };
  }

  return { totalSalesTrend, averageSaleTrend };
};

// Helper function to format sales data
export const formatSalesData = (salesData: any[]) => {
  return salesData.map(sale => ({
    id: sale.id,
    salesperson_id: sale.salesperson_id,
    salesperson_name: sale.salesperson_name || "Sem nome",
    gross_amount: sale.gross_amount,
    net_amount: sale.gross_amount, // Usamos o gross_amount como net_amount
    payment_method: convertToPaymentMethod(sale.payment_method),
    installments: sale.installments || 1,
    sale_date: sale.sale_date,
    created_at: sale.created_at,
    client_name: sale.client_name || "Cliente não identificado",
    client_phone: sale.client_phone || "",
    client_document: sale.client_document || ""
  }));
};
