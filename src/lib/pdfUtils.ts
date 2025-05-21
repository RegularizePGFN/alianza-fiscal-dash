
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { ExtractedData } from './types/proposals';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Helper function to format the filename based on the proposal data
const getProposalFilename = (data: Partial<ExtractedData>, extension: string): string => {
  const clientName = data.clientName || 'Cliente';
  const cnpj = data.cnpj || '';
  const dateStr = format(new Date(), 'dd-MM-yyyy', { locale: ptBR });
  
  // Convert to a filename-friendly format (no spaces, accents, or special characters)
  const safeClientName = clientName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '-')
    .replace(/-+/g, '-');

  return `proposta-${safeClientName}-${cnpj}-${dateStr}.${extension}`;
};

// Function to ensure all fonts and images are loaded before capturing
const ensureAllAssetsLoaded = async (): Promise<void> => {
  // Wait for fonts to load
  await document.fonts.ready;
  
  // Create a promise for each image element that isn't loaded yet
  const imgPromises = Array.from(document.querySelectorAll('img'))
    .filter(img => !img.complete)
    .map(img => new Promise<void>(resolve => {
      img.onload = () => resolve();
      img.onerror = () => resolve(); // Don't block on error, just continue
    }));
  
  // Wait for all images to load
  await Promise.all(imgPromises);
  
  // Small delay to ensure CSS animations/transitions complete
  await new Promise(resolve => setTimeout(resolve, 500));
};

/**
 * Generate a PNG image from the proposal
 */
export const generateProposalPng = async (
  element: HTMLElement,
  data: Partial<ExtractedData>
): Promise<void> => {
  try {
    // Ensure all fonts and images are loaded before capturing
    await ensureAllAssetsLoaded();
    
    // Improved html2canvas options for higher quality
    const canvas = await html2canvas(element, {
      scale: 4, // Higher scale for better quality
      useCORS: true, // Allow cross-origin images
      allowTaint: true, // Allow potentially tainted images
      logging: false, // Disable logging
      backgroundColor: '#ffffff', // Ensure white background
      imageTimeout: 15000, // Longer timeout for images
      onclone: (clonedDoc) => {
        // Any additional manipulations on cloned document if needed
        const clonedElement = clonedDoc.body.querySelector('div') as HTMLElement;
        if (clonedElement) {
          clonedElement.style.overflow = 'visible';
        }
      }
    });
    
    // Get the data URL and trigger download
    const imageData = canvas.toDataURL('image/png', 1.0);
    const filename = getProposalFilename(data, 'png');
    
    // Create a download link and trigger it
    const link = document.createElement('a');
    link.href = imageData;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('PNG generated successfully');
  } catch (error) {
    console.error('Error generating PNG:', error);
    throw error;
  }
};

/**
 * Generate a PDF from the proposal
 */
export const generateProposalPdf = async (
  element: HTMLElement,
  data: Partial<ExtractedData>
): Promise<void> => {
  try {
    // Ensure all fonts and images are loaded before capturing
    await ensureAllAssetsLoaded();
    
    // Create PDF with appropriate dimensions
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Get width and height in mm (assuming 96 DPI)
    const elementWidth = element.offsetWidth;
    const elementHeight = element.offsetHeight;
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    // Scale factor to fit the width of the PDF
    const scaleFactor = pageWidth / elementWidth;
    
    // Render the element to canvas with improved settings
    const canvas = await html2canvas(element, {
      scale: 3, // Higher scale for PDF quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 15000,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.body.querySelector('div') as HTMLElement;
        if (clonedElement) {
          clonedElement.style.overflow = 'visible';
        }
      }
    });
    
    // Convert canvas to image data
    const imgData = canvas.toDataURL('image/png', 1.0);
    
    // Calculate the height of the image in the PDF
    const imgHeight = elementHeight * scaleFactor;
    
    // Add the image to the PDF (fitting to page width)
    pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, imgHeight);
    
    // If content spans multiple pages, add new pages
    if (imgHeight > pdf.internal.pageSize.getHeight()) {
      let pageCount = Math.ceil(imgHeight / pdf.internal.pageSize.getHeight());
      let currentHeight = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Add each page
      for (let i = 1; i < pageCount; i++) {
        pdf.addPage();
        currentHeight += pageHeight;
        
        // Add the same image but with offset to show the appropriate portion
        pdf.addImage(
          imgData,
          'PNG',
          0,
          -currentHeight,
          pageWidth,
          imgHeight
        );
      }
    }
    
    // Save the PDF with a formatted filename
    const filename = getProposalFilename(data, 'pdf');
    pdf.save(filename);
    
    console.log('PDF generated successfully');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
