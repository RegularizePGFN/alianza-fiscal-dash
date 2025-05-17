
import { createWorker } from 'tesseract.js';
import { ExtractedData } from '@/lib/types/proposals';

// Helper to preprocess image data for better OCR results
const preprocessImageData = async (imageUrl: string): Promise<HTMLCanvasElement> => {
  // Create a canvas to manipulate the image
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  // Load the image
  const img = new Image();
  img.crossOrigin = 'Anonymous';
  
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = imageUrl;
  });
  
  // Set canvas dimensions
  canvas.width = img.width;
  canvas.height = img.height;
  
  // Draw original image
  ctx.drawImage(img, 0, 0);
  
  // Apply image preprocessing:
  // 1. Convert to grayscale
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i] = avg; // r
    data[i + 1] = avg; // g
    data[i + 2] = avg; // b
  }
  
  // 2. Increase contrast
  const contrast = 1.5; // Adjust as needed
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  
  for (let i = 0; i < data.length; i += 4) {
    data[i] = factor * (data[i] - 128) + 128;
    data[i + 1] = factor * (data[i + 1] - 128) + 128;
    data[i + 2] = factor * (data[i + 2] - 128) + 128;
  }
  
  // Put the processed image back
  ctx.putImageData(imageData, 0, 0);
  
  return canvas;
};

// Extract numeric values from text
const extractNumericValue = (text: string, prefix: string): string | null => {
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

// Extract percentage values from text
const extractPercentageValue = (text: string, prefix: string): string | null => {
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

// Extract CNPJ
const extractCNPJ = (text: string): string | null => {
  // CNPJ format: 00.000.000/0000-00
  const cnpjRegex = /\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/;
  const match = text.match(cnpjRegex);
  
  return match ? match[0] : null;
};

// Extract debt number
const extractDebtNumber = (text: string): string | null => {
  // Common debt number patterns
  const debtRegex = /\d{2}\s\d\s\d{2}\s\d{6}-\d{2}/;
  const match = text.match(debtRegex);
  
  return match ? match[0] : null;
};

// Parse extracted OCR text into structured data
const parseExtractedText = (text: string): Partial<ExtractedData> => {
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

// Main OCR function to extract data from an image
export const extractDataFromImage = async (imageUrl: string, 
  updateProgress: (progress: number) => void): Promise<Partial<ExtractedData>> => {
  try {
    console.log("Starting OCR process...");
    updateProgress(5);
    
    // Initialize Tesseract worker with proper configuration
    const worker = await createWorker({
      logger: m => {
        console.log('Tesseract progress:', m);
        if (m.status === 'recognizing text') {
          updateProgress(Math.floor(m.progress * 100));
        }
      },
      // Ensure Tesseract uses CDN-based assets to avoid loading issues
      workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@4.1.1/dist/worker.min.js',
      langPath: 'https://tessdata.projectnaptha.com/4.0.0',
      corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@4.0.4/tesseract-core.wasm.js',
      cachePath: '/tmp',
    });
    
    updateProgress(20);
    console.log("Worker initialized, loading language...");
    
    // Load Portuguese language data
    await worker.loadLanguage('por');
    updateProgress(30);
    
    await worker.initialize('por');
    updateProgress(40);
    console.log("Language loaded, processing image...");
    
    // Use a try-catch inside to handle image processing errors separately
    try {
      // Preprocess the image for better OCR results
      const processedCanvas = await preprocessImageData(imageUrl);
      updateProgress(50);
      console.log("Image preprocessed, starting recognition...");
      
      // Perform OCR on the preprocessed image
      const result = await worker.recognize(processedCanvas);
      updateProgress(90);
      console.log("OCR completed, parsing text...");
      
      // Parse the extracted text into structured data
      const extractedData = parseExtractedText(result.data.text);
      
      // Terminate the worker
      await worker.terminate();
      updateProgress(100);
      console.log("OCR process completed successfully");
      
      return extractedData;
    } catch (imageError) {
      console.error("Image processing error:", imageError);
      await worker.terminate(); // Ensure worker is terminated on error
      throw new Error(`Image processing failed: ${imageError.message}`);
    }
  } catch (error) {
    console.error("OCR Error:", error);
    updateProgress(100); // Ensure progress completes even on error
    throw error;
  }
};
