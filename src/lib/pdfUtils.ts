
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
    
    // Create a temporary container for the PDF content with all necessary styles
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = '210mm'; // A4 width
    tempContainer.style.padding = '0';
    tempContainer.style.margin = '0';
    tempContainer.style.backgroundColor = 'white';
    
    // Hide action buttons
    const actionButtons = clonedElement.querySelectorAll('.pdf-action-buttons, [data-pdf-remove="true"], button');
    actionButtons.forEach(button => {
      if (button instanceof HTMLElement) {
        button.style.display = 'none';
      }
    });
    
    // Append styles for PDF rendering
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      /* Ensure Roboto font is loaded */
      @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
      
      /* Make sure all content fits on page */
      * {
        box-sizing: border-box;
        font-family: 'Roboto', sans-serif !important;
      }
      
      /* Hide button elements */
      button, [data-pdf-remove="true"] {
        display: none !important;
      }
      
      /* Preserve colors and backgrounds */
      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
        background-color: white;
      }
    `;
    
    // Add the element to the temporary container
    tempContainer.appendChild(styleElement);
    tempContainer.appendChild(clonedElement);
    
    // Append to document body temporarily
    document.body.appendChild(tempContainer);
    
    // Get the HTML content as a string
    const html = tempContainer.outerHTML;
    
    // Remove the temporary container
    document.body.removeChild(tempContainer);
    
    // Use Puppeteer to generate the PDF in a browser context
    const generatePdf = async () => {
      // Launch headless browser
      const browser = await puppeteer.launch({ 
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      try {
        // Create a new page
        const page = await browser.newPage();
        
        // Set viewport to A4 size
        await page.setViewport({
          width: 794, // A4 width at 96 DPI
          height: 1123, // A4 height at 96 DPI
          deviceScaleFactor: 2,
        });
        
        // Include Google Fonts
        const fontStyles = `
          <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
        `;
        
        // Create full HTML document
        const fullHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              ${fontStyles}
              <style>
                body {
                  margin: 0;
                  padding: 0;
                  font-family: 'Roboto', sans-serif;
                  background-color: white;
                }
                .proposal-container {
                  padding: 20px;
                  max-width: 210mm;
                  margin: 0 auto;
                }
              </style>
            </head>
            <body>
              <div class="proposal-container">
                ${html}
              </div>
            </body>
          </html>
        `;
        
        // Set the page content
        await page.setContent(fullHtml, { 
          waitUntil: ['networkidle0', 'domcontentloaded', 'load'] 
        });
        
        // Wait for fonts to load
        await page.evaluateHandle('document.fonts.ready');
        
        // Wait a bit more for any renders to complete
        await page.waitForTimeout(500);
        
        // Generate PDF buffer
        const pdfBuffer = await page.pdf({
          format: 'a4',
          printBackground: true,
          margin: {
            top: '10mm',
            right: '10mm',
            bottom: '10mm',
            left: '10mm',
          },
          displayHeaderFooter: false,
        });
        
        // Create a blob from the buffer
        const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
        
        // Create a download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        
        // Start download
        a.click();
        
        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
      } finally {
        // Always close the browser
        await browser.close();
      }
    };
    
    // Execute the PDF generation
    await generatePdf();
    
    return Promise.resolve();
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    return Promise.reject(error);
  }
}
