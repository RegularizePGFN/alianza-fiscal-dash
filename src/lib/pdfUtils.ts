
import puppeteer from 'puppeteer';
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
    const actionButtons = clonedElement.querySelectorAll('.pdf-action-buttons, [data-pdf-remove="true"], button');
    actionButtons.forEach(button => {
      if (button instanceof HTMLElement) {
        button.style.display = 'none';
      }
    });
    
    // Get the HTML content with styles
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
          }
          ${styles}
          /* Additional PDF-specific styles */
          .preview-proposal {
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
            page-break-inside: avoid;
          }
          /* Ensure colors and backgrounds are printed */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `;
    
    // Generate PDF using Puppeteer in browser environment
    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    const page = await browser.newPage();
    
    // Set content and wait for network idle
    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
    
    // Set viewport to A4 size
    await page.setViewport({
      width: 794, // A4 width in px at 96 dpi
      height: 1123, // A4 height in px at 96 dpi
      deviceScaleFactor: 2, // Higher for better quality
    });
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'a4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm'
      },
      preferCSSPageSize: true,
    });
    
    await browser.close();
    
    // Create blob and download
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
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
