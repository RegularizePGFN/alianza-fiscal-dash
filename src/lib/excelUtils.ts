
import * as XLSX from 'xlsx';
import { Sale, PaymentMethod } from '@/lib/types';
import { convertToPaymentMethod } from '@/lib/utils';

// Function to export sales data to Excel
export const exportSalesToExcel = (sales: Sale[], fileName = 'vendas.xlsx') => {
  try {
    console.log(`Preparing to export ${sales.length} sales records to Excel`);
    
    // Format sales data for Excel
    const workbook = XLSX.utils.book_new();
    const worksheetData = sales.map((sale) => {
      // Format date string properly for display (DD/MM/YYYY)
      let displayDate = '';
      if (typeof sale.sale_date === 'string' && sale.sale_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = sale.sale_date.split('-');
        displayDate = `${day}/${month}/${year}`;
      } else if (sale.sale_date instanceof Date) {
        displayDate = sale.sale_date.toLocaleDateString('pt-BR');
      } else {
        displayDate = String(sale.sale_date);
      }
      
      return {
        'ID': sale.id,
        'Data da Venda': displayDate,
        'Cliente': sale.client_name,
        'Documento': sale.client_document,
        'Telefone': sale.client_phone,
        'Valor': sale.gross_amount,
        'Método de Pagamento': sale.payment_method.toString(),
        'Parcelas': sale.installments,
        'Vendedor': sale.salesperson_name,
      };
    });

    console.log(`Formatted ${worksheetData.length} rows for Excel export`);

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    
    // Set column widths
    const columnsWidth = [
      { wch: 40 }, // ID
      { wch: 15 }, // Data da Venda
      { wch: 30 }, // Cliente
      { wch: 20 }, // Documento
      { wch: 15 }, // Telefone
      { wch: 15 }, // Valor
      { wch: 15 }, // Método de Pagamento
      { wch: 10 }, // Parcelas
      { wch: 20 }, // Vendedor
    ];
    
    worksheet['!cols'] = columnsWidth;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vendas');

    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, fileName);
    console.log("Excel file generated and download triggered");
    return true;
  } catch (error) {
    console.error('Error exporting sales to Excel:', error);
    return false;
  }
};

// Function to validate and parse Excel data for import
export const importSalesFromExcel = async (file: File): Promise<Omit<Sale, 'id'>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        console.log(`Imported ${jsonData.length} rows from Excel`);

        // Process and validate the data
        const salesData = jsonData.map((row: any) => {
          // Extract date and ensure it's in the correct format (YYYY-MM-DD)
          let saleDate: string;
          if (row['Data da Venda']) {
            // Handle various date formats
            const dateParts = row['Data da Venda'].toString().split('/');
            if (dateParts.length === 3) {
              // Format DD/MM/YYYY to YYYY-MM-DD
              saleDate = `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`;
            } else {
              // Attempt to parse as ISO date
              saleDate = new Date(row['Data da Venda']).toISOString().split('T')[0];
            }
          } else {
            saleDate = new Date().toISOString().split('T')[0]; // Default to today
          }

          // Handle payment method
          const paymentMethodStr = row['Método de Pagamento'] || 'Pix';
          
          return {
            salesperson_id: '', // This will be set by the backend
            salesperson_name: row['Vendedor'] || '',
            gross_amount: parseFloat(row['Valor']) || 0,
            net_amount: parseFloat(row['Valor']) || 0, // Same as gross for now
            payment_method: convertToPaymentMethod(paymentMethodStr),
            installments: parseInt(row['Parcelas']) || 1,
            sale_date: saleDate,
            client_name: row['Cliente'] || 'Cliente',
            client_phone: row['Telefone'] || '',
            client_document: row['Documento'] || '',
          };
        });

        console.log(`Processed ${salesData.length} sales records for import`);
        resolve(salesData);
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        reject(error);
      }
    };

    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      reject(error);
    };

    reader.readAsBinaryString(file);
  });
};
