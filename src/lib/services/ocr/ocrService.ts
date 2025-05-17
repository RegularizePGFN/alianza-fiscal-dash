
import { createWorker } from 'tesseract.js';
import { ExtractedData } from '@/lib/types/proposals';
import { preprocessImageData } from './imageProcessor';
import { parseExtractedText } from './dataParser';
import { getTesseractConfig } from './tesseractConfig';

/**
 * Main OCR function to extract data from an image
 */
export const extractDataFromImage = async (
  imageUrl: string, 
  updateProgress: (progress: number) => void
): Promise<Partial<ExtractedData>> => {
  try {
    console.log("Starting OCR process...");
    updateProgress(5);
    
    // Initialize Tesseract worker with proper configuration
    const worker = await createWorker({
      ...getTesseractConfig(m => {
        console.log('Tesseract progress:', m);
        if (m.status === 'recognizing text') {
          updateProgress(Math.floor(m.progress * 100));
        }
      })
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
