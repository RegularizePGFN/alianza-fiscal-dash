import * as XLSX from 'xlsx';
import { Sale } from './types';

export function exportSalesToExcel(sales: Sale[], filename: string = 'sales-report.xlsx'): void {
  
  const workbook = XLSX.utils.book_new();
  const data = sales.map(sale => {
    // Format the date for display
    let displayDate = "N/A";
    
    // Ensure sale.sale_date is defined before accessing it
    if (sale.sale_date) {
      if (typeof sale.sale_date === 'string' && sale.sale_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = sale.sale_date.split('-');
        displayDate = `${day}/${month}/${year}`;
      } else if (typeof sale.sale_date === 'object' && 'toLocaleDateString' in sale.sale_date) {
        // Check if it's a date-like object with toLocaleDateString method
        displayDate = sale.sale_date.toLocaleDateString('pt-BR');
      } else {
        // Fallback for other formats
        displayDate = String(sale.sale_date);
      }
    }
    
    return {
      ID: sale.id,
      Vendedor: sale.salesperson_name || sale.salesperson_id,
      ValorBruto: sale.gross_amount,
      ValorLiquido: sale.net_amount,
      MetodoPagamento: sale.payment_method,
      Parcelas: sale.installments,
      DataVenda: displayDate,
      ClienteNome: sale.client_name,
      ClienteTelefone: sale.client_phone,
      ClienteDocumento: sale.client_document,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales');

  XLSX.writeFile(workbook, filename);
}
