
import { ExtractedData } from '@/lib/types/proposals';
import { extractCNPJ, extractDebtNumber, extractNumericValue, extractPercentageValue } from './textExtractors';

/**
 * Parses extracted OCR text into structured data
 */
export const parseExtractedText = (text: string): Partial<ExtractedData> => {
  console.log("OCR Raw Text:", text);
  
  const data: Partial<ExtractedData> = {};
  
  // Extract CNPJ
  const cnpj = extractCNPJ(text);
  if (cnpj) data.cnpj = cnpj;
  
  // Extract debt number
  const debtNumber = extractDebtNumber(text);
  if (debtNumber) data.debtNumber = debtNumber;
  
  // Extract total debt
  const totalDebt = extractNumericValue(text, "valor consolidado") || 
                    extractNumericValue(text, "valor total");
  if (totalDebt) data.totalDebt = totalDebt;
  
  // Extract discounted value
  const discountedValue = extractNumericValue(text, "valor com reduções") || 
                          extractNumericValue(text, "valor após reduções");
  if (discountedValue) data.discountedValue = discountedValue;
  
  // Extract discount percentage
  const discountPercentage = extractPercentageValue(text, "desconto") || 
                            extractPercentageValue(text, "redução");
  if (discountPercentage) data.discountPercentage = discountPercentage;
  
  // Extract entry value
  const entryValue = extractNumericValue(text, "entrada") || 
                     extractNumericValue(text, "valor da entrada");
  if (entryValue) data.entryValue = entryValue;
  
  // Extract installments
  const installments = text.match(/(\d+)\s*parcelas/i);
  if (installments && installments[1]) {
    data.installments = installments[1];
  }
  
  // Extract installment value
  const installmentValue = extractNumericValue(text, "valor da parcela") || 
                          extractNumericValue(text, "parcela de");
  if (installmentValue) data.installmentValue = installmentValue;
  
  // Default values for fields we may not find directly
  if (!data.entryInstallments) {
    data.entryInstallments = '1'; // Default for entry installments
  }
  
  // Calculate fees if total and discounted are available but fees aren't found
  if (data.discountedValue && !data.feesValue) {
    const discountedAsNumber = parseFloat(data.discountedValue.replace('.', '').replace(',', '.'));
    const feesValue = (discountedAsNumber * 0.1).toFixed(2).replace('.', ','); // 10% of discounted value
    data.feesValue = feesValue;
  }
  
  return data;
};
