
import * as XLSX from 'xlsx';
import { Sale, PaymentMethod } from './types';

export const exportSalesToExcel = (sales: Sale[], fileName: string = 'vendas.xlsx') => {
  try {
    // Map sales to format suitable for Excel
    const data = sales.map(sale => {
      // Handle the date display
      let displayDate = 'Data não disponível';
      
      // First check if sale.sale_date is defined at all
      if (sale.sale_date) {
        // Check if it's a Date object by checking for toLocaleDateString method
        if (typeof sale.sale_date === 'object' && sale.sale_date instanceof Date) {
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

// Add the missing import function
export const importSalesFromExcel = async (file: File): Promise<Partial<Sale>[] | null> => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          if (!e.target || !e.target.result) {
            resolve(null);
            return;
          }
          
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convert worksheet to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          // Map the Excel data to our Sale type
          const sales = jsonData.map((row: any) => {
            // Handle possible field naming variations
            const mappedSale: Partial<Sale> = {
              // Try to map Excel columns to our data structure
              client_name: row['Cliente'] || row['Nome do Cliente'] || '',
              client_document: row['Documento'] || row['CPF/CNPJ'] || '',
              client_phone: row['Telefone'] || row['Celular'] || '',
              gross_amount: parseFloat(row['Valor Bruto'] || row['Valor'] || 0),
              payment_method: convertPaymentMethod(row['Método de Pagamento'] || row['Forma de Pagamento'] || ''),
              installments: parseInt(row['Parcelas'] || 1),
              sale_date: parseExcelDate(row['Data'] || new Date().toISOString().split('T')[0]),
            };
            
            return mappedSale;
          });
          
          resolve(sales);
        } catch (err) {
          console.error('Erro ao processar arquivo Excel:', err);
          reject(err);
        }
      };
      
      reader.onerror = (error) => {
        console.error('Erro ao ler arquivo:', error);
        reject(error);
      };
      
      // Read the file as binary
      reader.readAsBinaryString(file);
    } catch (error) {
      console.error('Erro ao importar do Excel:', error);
      reject(error);
    }
  });
};

// Helper function to parse date values from Excel
const parseExcelDate = (dateValue: any): string => {
  if (!dateValue) return new Date().toISOString().split('T')[0];
  
  try {
    // If it's already a formatted string like DD/MM/YYYY
    if (typeof dateValue === 'string' && dateValue.includes('/')) {
      const [day, month, year] = dateValue.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    // For Excel's numeric date format
    if (typeof dateValue === 'number') {
      const excelEpoch = new Date(1899, 11, 30);
      const date = new Date(excelEpoch);
      date.setDate(excelEpoch.getDate() + dateValue);
      return date.toISOString().split('T')[0];
    }
    
    // If it's a Date object
    if (dateValue instanceof Date) {
      return dateValue.toISOString().split('T')[0];
    }
    
    // Default to today if we can't parse
    return new Date().toISOString().split('T')[0];
  } catch (error) {
    console.error('Erro ao converter data:', error, dateValue);
    return new Date().toISOString().split('T')[0];
  }
};

// Helper function to convert payment method strings to our enum
const convertPaymentMethod = (method: string): PaymentMethod => {
  const lowerMethod = method.toLowerCase();
  if (lowerMethod.includes('boleto')) return PaymentMethod.BOLETO;
  if (lowerMethod.includes('pix')) return PaymentMethod.PIX;
  if (lowerMethod.includes('cred')) return PaymentMethod.CREDIT;
  if (lowerMethod.includes('deb')) return PaymentMethod.DEBIT;
  return PaymentMethod.CREDIT; // Default
};
