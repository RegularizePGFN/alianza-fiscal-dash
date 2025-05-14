import * as XLSX from 'xlsx';
import { Sale } from './types';

export function exportSalesToExcel(sales: Sale[], filename: string = 'sales-report.xlsx'): boolean {
  try {
    const workbook = XLSX.utils.book_new();
    const data = sales.map(sale => {
      // Format the date for display
      let displayDate = "N/A";
      
      // Enhanced null check for sale.sale_date
      if (sale.sale_date != null) {
        if (typeof sale.sale_date === 'string' && sale.sale_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const [year, month, day] = sale.sale_date.split('-');
          displayDate = `${day}/${month}/${year}`;
        } else if (
          typeof sale.sale_date === 'object' && 
          sale.sale_date !== null && 
          'toLocaleDateString' in sale.sale_date
        ) {
          // Check if it's a date-like object with toLocaleDateString method
          const dateObject = sale.sale_date as Date;
          displayDate = dateObject.toLocaleDateString('pt-BR');
        } else if (sale.sale_date) {
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
    return true;
  } catch (error) {
    console.error("Error exporting sales to Excel:", error);
    return false;
  }
}

// Add import function since it's referenced but not defined
export function importSalesFromExcel(file: File): Promise<Partial<Sale>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error("Failed to read file"));
          return;
        }

        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Transform the Excel data to match our Sale structure
        const salesData: Partial<Sale>[] = jsonData.map((row: any) => {
          // Parse the date from DD/MM/YYYY to YYYY-MM-DD
          let saleDate = row.DataVenda;
          if (typeof saleDate === 'string' && saleDate.includes('/')) {
            const [day, month, year] = saleDate.split('/');
            saleDate = `${year}-${month}-${day}`;
          }
          
          return {
            salesperson_name: row.Vendedor,
            gross_amount: Number(row.ValorBruto),
            net_amount: Number(row.ValorLiquido || row.ValorBruto),
            payment_method: row.MetodoPagamento,
            installments: Number(row.Parcelas || 1),
            sale_date: saleDate,
            client_name: row.ClienteNome || 'Client',
            client_phone: row.ClienteTelefone || '',
            client_document: row.ClienteDocumento || '',
          };
        });

        resolve(salesData);
      } catch (error) {
        console.error("Error importing Excel file:", error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsBinaryString(file);
  });
}
