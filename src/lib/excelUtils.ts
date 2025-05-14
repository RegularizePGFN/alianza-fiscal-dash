
import * as XLSX from 'xlsx';
import { Sale } from './types';

export const exportSalesToExcel = (sales: Sale[], fileName: string = 'vendas.xlsx') => {
  try {
    // Map sales to format suitable for Excel
    const data = sales.map(sale => {
      // Handle the date display
      let displayDate = 'Data não disponível';
      
      // First check if sale.sale_date is defined at all
      if (sale.sale_date) {
        // Check if it's a Date object by checking for toLocaleDateString method
        if (sale.sale_date instanceof Date) {
          displayDate = sale.sale_date.toLocaleDateString('pt-BR');
        } else if (typeof sale.sale_date === 'string') {
          // If it's a string, we can use it directly or try to parse it
          if (sale.sale_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
            // It's in ISO format (YYYY-MM-DD), convert for Brazilian format
            const [year, month, day] = sale.sale_date.split('-');
            displayDate = `${day}/${month}/${year}`;
          } else {
            // Just use the string as is
            displayDate = sale.sale_date;
          }
        } else {
          // Fallback: convert to string whatever it is
          displayDate = String(sale.sale_date);
        }
      }
      
      return {
        'Data': displayDate,
        'Cliente': sale.client_name || 'Não informado',
        'Documento': sale.client_document || 'Não informado',
        'Telefone': sale.client_phone || 'Não informado',
        'Valor Bruto': sale.gross_amount,
        'Método de Pagamento': sale.payment_method,
        'Parcelas': sale.installments,
        'Vendedor': sale.salesperson_name || 'Não informado',
      };
    });

    // Create workbook and add worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Vendas');

    // Generate & save the file
    XLSX.writeFile(wb, fileName);
    return true;
  } catch (error) {
    console.error('Erro ao exportar para Excel:', error);
    return false;
  }
};
