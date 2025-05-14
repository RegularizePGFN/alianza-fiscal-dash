import * as XLSX from 'xlsx';
import { Sale, PaymentMethod } from './types';

/**
 * Exporta vendas para um arquivo Excel (.xlsx).
 * @param sales Lista de objetos Sale a serem exportados.
 * @param fileName Nome do arquivo de saída (padrão: 'vendas.xlsx').
 * @returns true se exportação for bem-sucedida, false caso contrário.
 */
export const exportSalesToExcel = (
  sales: Sale[],
  fileName: string = 'vendas.xlsx'
): boolean => {
  try {
    const data = sales.map(sale => {
      const saleDate = sale.sale_date;
      let displayDate = 'Data não disponível';

      if (saleDate != null) {
        if (saleDate instanceof Date) {
          displayDate = saleDate.toLocaleDateString('pt-BR');
        } else if (typeof saleDate === 'string') {
          if (/^\d{4}-\d{2}-\d{2}$/.test(saleDate)) {
            const [year, month, day] = saleDate.split('-');
            displayDate = `${day}/${month}/${year}`;
          } else {
            displayDate = saleDate;
          }
        } else {
          displayDate = String(saleDate);
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

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Vendas');

    XLSX.writeFile(wb, fileName);
    return true;
  } catch (error) {
    console.error('Erro ao exportar para Excel:', error);
    return false;
  }
};

/**
 * Importa vendas de um arquivo Excel (.xlsx).
 * @param file Objeto File representando o arquivo a ser lido.
 * @returns Promise com array de Partial<Sale> ou null em caso de falha.
 */
export const importSalesFromExcel = async (
  file: File
): Promise<Partial<Sale>[] | null> => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          if (!e.target || !e.target.result) {
            resolve(null);
            return;
          }

          const data = e.target.result as string;
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);
          const sales = jsonData.map(row => {
            const mappedSale: Partial<Sale> = {
              client_name: row['Cliente'] || row['Nome do Cliente'] || '',
              client_document: row['Documento'] || row['CPF/CNPJ'] || '',
              client_phone: row['Telefone'] || row['Celular'] || '',
              gross_amount: parseFloat(row['Valor Bruto'] || row['Valor'] || 0),
              payment_method: convertPaymentMethod(
                row['Método de Pagamento'] || row['Forma de Pagamento'] || ''
              ),
              installments: parseInt(row['Parcelas'] || 1, 10),
              sale_date: parseExcelDate(
                row['Data'] || new Date().toISOString().split('T')[0]
              ),
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

      reader.readAsBinaryString(file);
    } catch (error) {
      console.error('Erro ao importar do Excel:', error);
      reject(error);
    }
  });
};

/**
 * Converte valores de data do Excel para string no formato ISO YYYY-MM-DD.
 */
const parseExcelDate = (dateValue: any): string => {
  if (!dateValue) {
    return new Date().toISOString().split('T')[0];
  }
  try {
    if (typeof dateValue === 'string' && dateValue.includes('/')) {
      const [day, month, year] = dateValue.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    if (typeof dateValue === 'number') {
      const excelEpoch = new Date(1899, 11, 30);
      const date = new Date(excelEpoch);
      date.setDate(excelEpoch.getDate() + dateValue);
      return date.toISOString().split('T')[0];
    }

    if (dateValue instanceof Date) {
      return dateValue.toISOString().split('T')[0];
    }

    return new Date().toISOString().split('T')[0];
  } catch (error) {
    console.error('Erro ao converter data:', error, dateValue);
    return new Date().toISOString().split('T')[0];
  }
};

/**
 * Converte string de método de pagamento para enum PaymentMethod.
 */
const convertPaymentMethod = (method: string): PaymentMethod => {
  const lower = method.toLowerCase();
  if (lower.includes('boleto')) return PaymentMethod.BOLETO;
  if (lower.includes('pix'))    return PaymentMethod.PIX;
  if (lower.includes('cred'))   return PaymentMethod.CREDIT;
  if (lower.includes('deb'))    return PaymentMethod.DEBIT;
  return PaymentMethod.CREDIT;
};
