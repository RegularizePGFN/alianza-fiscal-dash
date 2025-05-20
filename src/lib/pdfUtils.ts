
import { ExtractedData } from './types/proposals';

export async function generateProposalPdf(proposalElement: HTMLElement, data: Partial<ExtractedData>): Promise<void> {
  try {
    // Get specialist name for filename
    const specialist = data.specialistName ? 
      data.specialistName.replace(/[^\w]/g, '_').toLowerCase() : 'especialista';
    
    // File name
    const fileName = `proposta_pgfn_${data.cnpj?.replace(/\D/g, '') || 'cliente'}_${specialist}.pdf`;

    // Clone the element to avoid modifying the original
    const clonedElement = proposalElement.cloneNode(true) as HTMLElement;
    
    // Hide action buttons and other elements not needed in PDF
    const elementsToRemove = clonedElement.querySelectorAll('.pdf-action-buttons, [data-pdf-remove="true"], button');
    elementsToRemove.forEach(element => {
      if (element instanceof HTMLElement) {
        element.style.display = 'none';
      }
    });
    
    // Get the HTML content
    const htmlContent = clonedElement.outerHTML;
    
    // Get all stylesheets from the document
    const styleSheets = Array.from(document.styleSheets);
    let styles = '';
    
    // Extract styles from stylesheets
    styleSheets.forEach(sheet => {
      try {
        if (sheet.cssRules) {
          const cssRules = Array.from(sheet.cssRules);
          cssRules.forEach(rule => {
            styles += rule.cssText + '\n';
          });
        }
      } catch (e) {
        // Skip external stylesheets that might cause CORS issues
        console.warn('Could not access stylesheet rules:', e);
      }
    });
    
    // Create a full HTML document with the extracted content and styles
    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${fileName}</title>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
        <style>
          @page {
            size: A4;
            margin: 10mm;
          }
          body {
            font-family: 'Roboto', sans-serif;
            margin: 0;
            padding: 0;
            color: #333;
            background-color: white;
            font-size: 12px; /* Slightly smaller font to fit content */
          }
          ${styles}
          /* Additional PDF-specific styles */
          .preview-proposal {
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
            page-break-inside: avoid;
          }
          /* Optimize spacing for single page */
          .space-y-8 {
            margin-top: 1.5rem !important;
            margin-bottom: 1.5rem !important;
          }
          .pt-6 {
            padding-top: 1rem !important;
          }
          .pb-8 {
            padding-bottom: 1rem !important;
          }
          .px-8 {
            padding-left: 1.5rem !important;
            padding-right: 1.5rem !important;
          }
          /* Ensure all grid cells take minimal height */
          .grid > div {
            padding: 0.75rem !important;
          }
          /* Ensure colors and backgrounds are printed */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          /* Ensure no page breaks within sections */
          section, .card, .bg-gradient-to-r {
            page-break-inside: avoid;
          }
          /* Scale content to fit page */
          .card {
            transform: scale(0.95);
            transform-origin: top center;
          }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `;
    
    console.log('Sending HTML to API for PDF generation...');
    
    // Make API call to the PDF generation endpoint
    const response = await fetch('/api/propostas/pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html: fullHtml,
        fileName: fileName,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.details || errorData.error || response.statusText;
      throw new Error(`API error: ${errorMessage}`);
    }
    
    console.log('PDF generated successfully, creating download...');
    
    // Get the binary data
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    
    // Create a download link
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    
    return Promise.resolve();
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    return Promise.reject(error);
  }
}
