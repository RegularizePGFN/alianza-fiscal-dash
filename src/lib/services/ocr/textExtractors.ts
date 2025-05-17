
/**
 * Extracts numeric values from OCR text
 */
export const extractNumericValue = (text: string, prefix: string): string | null => {
  // Find the line containing the prefix
  const lines = text.split('\n');
  const targetLine = lines.find(line => 
    line.toLowerCase().includes(prefix.toLowerCase())
  );
  
  if (!targetLine) return null;
  
  // Extract numeric value (format: 0.000,00 or 0,00)
  const numberRegex = /\d{1,3}(?:\.\d{3})*(?:,\d{2})/;
  const match = targetLine.match(numberRegex);
  
  return match ? match[0] : null;
};

/**
 * Extracts percentage values from OCR text
 */
export const extractPercentageValue = (text: string, prefix: string): string | null => {
  // Find the line containing the prefix
  const lines = text.split('\n');
  const targetLine = lines.find(line => 
    line.toLowerCase().includes(prefix.toLowerCase())
  );
  
  if (!targetLine) return null;
  
  // Extract percentage value (format: 00,00%)
  const percentageRegex = /\d{1,2}(?:,\d{2})?%/;
  const match = targetLine.match(percentageRegex);
  
  if (match) {
    // Remove % sign and return just the number
    return match[0].replace('%', '');
  }
  
  return null;
};

/**
 * Extracts CNPJ from OCR text
 */
export const extractCNPJ = (text: string): string | null => {
  // CNPJ format: 00.000.000/0000-00
  const cnpjRegex = /\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/;
  const match = text.match(cnpjRegex);
  
  return match ? match[0] : null;
};

/**
 * Extracts debt number from OCR text
 */
export const extractDebtNumber = (text: string): string | null => {
  // Common debt number patterns
  const debtRegex = /\d{2}\s\d\s\d{2}\s\d{6}-\d{2}/;
  const match = text.match(debtRegex);
  
  return match ? match[0] : null;
};
