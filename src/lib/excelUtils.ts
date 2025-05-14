import { read, utils } from 'xlsx';
import { Sale } from './types';
import { convertToPaymentMethod } from './utils';

// Function to generate Excel file from sales data
export const generateExcelFile = (salesData: Sale[], fileName: string) => {
  // Step 1: Prepare your data
  const data = salesData.map(sale => ({
    ID: sale.id,
    'ID do Vendedor': sale.salesperson_id,
    'Nome do Vendedor': sale.salesperson_name,
    'Valor Bruto': sale.gross_amount,
    'Valor Líquido': sale.net_amount,
    'Forma de Pagamento': sale.payment_method,
    Parcelas: sale.installments,
    'Data da Venda': sale.sale_date,
    'Nome do Cliente': sale.client_name,
    'Telefone do Cliente': sale.client_phone,
    'Documento do Cliente': sale.client_document,
  }));

  // Step 2: Create a new workbook
  const wb = utils.book_new();

  // Step 3: Convert the data to a worksheet
  const ws = utils.json_to_sheet(data);

  // Step 4: Add the worksheet to the workbook
  utils.book_append_sheet(wb, ws, "Vendas");

  // Step 5: Generate the Excel file
  const wopts = { bookType: 'xlsx', bookSST: false, type: 'array' };
  const wbout = read(utils.encode(wb, wopts), { type: 'binary' });

  // Step 6: Trigger the download
  const blob = new Blob([new Uint8Array(wbout.content)], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Fix the TypeScript error related to date handling in the importSalesFromExcel function
export const importSalesFromExcel = (file: File): Promise<Sale[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = read(data, { type: 'array' });
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const jsonData = utils.sheet_to_json<any>(worksheet);
        
        const importedSales: Sale[] = jsonData.map((row: any) => {
          // Handle date conversions safely
          let saleDate = '';
          
          if (row['Data da Venda']) {
            // Handle Excel date (number format)
            if (typeof row['Data da Venda'] === 'number') {
              const excelDate = row['Data da Venda'];
              const dateObj = new Date(Math.floor((excelDate - 25569) * 86400 * 1000));
              saleDate = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD format
            } 
            // Handle string date format
            else if (typeof row['Data da Venda'] === 'string') {
              const dateParts = row['Data da Venda'].split('/');
              if (dateParts.length === 3) {
                // Convert DD/MM/YYYY to YYYY-MM-DD
                saleDate = `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`;
              } else {
                // If date is already in YYYY-MM-DD format or another format
                saleDate = row['Data da Venda'];
              }
            }
            // Handle JavaScript Date object
            else if (row['Data da Venda'] instanceof Date) {
              saleDate = row['Data da Venda'].toISOString().split('T')[0];
            }
          }
          
          return {
            id: row.id || crypto.randomUUID(),
            salesperson_id: row['ID do Vendedor'] || '',
            salesperson_name: row['Nome do Vendedor'] || 'Não especificado',
            gross_amount: Number(row['Valor Bruto'] || 0),
            net_amount: Number(row['Valor Líquido'] || row['Valor Bruto'] || 0),
            payment_method: convertToPaymentMethod(row['Forma de Pagamento']),
            installments: Number(row['Parcelas'] || 1),
            sale_date: saleDate,
            client_name: row['Nome do Cliente'] || 'Cliente não identificado',
            client_phone: row['Telefone do Cliente'] || '',
            client_document: row['Documento do Cliente'] || ''
          };
        });
        
        resolve(importedSales);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};
