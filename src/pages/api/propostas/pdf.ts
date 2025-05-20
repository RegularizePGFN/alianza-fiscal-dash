
import type { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { html, fileName = 'proposta.pdf' } = req.body;

    if (!html) {
      return res.status(400).json({ error: 'HTML content is required' });
    }

    // Validate HTML has minimum required structure
    if (!html.includes('<!DOCTYPE html>') || !html.includes('<html') || !html.includes('<body')) {
      console.error('Invalid HTML structure received');
      return res.status(400).json({ error: 'Invalid HTML structure received. HTML must include DOCTYPE, html and body tags.' });
    }

    console.log('Starting PDF generation process...');

    // Launch a new browser instance with proper settings, trying both headless modes
    const browser = await puppeteer.launch({
      headless: true, // Use boolean instead of 'new' which may not be supported in all environments
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage', // Overcome limited resource issues
        '--disable-gpu',           // Disable GPU hardware acceleration
        '--disable-web-security'   // Allow cross-origin requests
      ],
      timeout: 60000 // 60 second timeout for browser launch
    }).catch(async (err) => {
      console.error('Failed to launch browser with headless:true, trying headless:"new":', err);
      return puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-web-security'
        ],
        timeout: 60000
      });
    });

    console.log('Browser launched successfully');
    
    const page = await browser.newPage();
    
    // Set more generous timeout for content loading
    await page.setDefaultNavigationTimeout(30000);
    await page.setDefaultTimeout(30000);
    
    // Set the content and wait for network idle (ensure all resources are loaded)
    console.log('Setting page content...');
    await page.setContent(html, { 
      waitUntil: ['networkidle0', 'load', 'domcontentloaded'],
      timeout: 30000
    }).catch((err) => {
      throw new Error(`Error setting page content: ${err.message}`);
    });
    
    console.log('Content loaded in browser page');
    
    // Set viewport to A4 size with better scaling for higher quality
    await page.setViewport({
      width: 794, // A4 width in px at 96 dpi
      height: 1123, // A4 height in px at 96 dpi
      deviceScaleFactor: 2, // Higher for better quality
    });
    
    // Generate PDF with specific settings for A4 size and proper margins
    console.log('Generating PDF...');
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
      timeout: 60000 // 60 second timeout for PDF generation
    }).catch((err) => {
      throw new Error(`Error generating PDF: ${err.message}`);
    });
    
    console.log('PDF generated successfully');
    await browser.close();
    console.log('Browser closed');
    
    // Set appropriate headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    // Send the PDF buffer
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('Detailed PDF generation error:', error);
    // Send more detailed error message to client
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      error: 'Failed to generate PDF', 
      details: errorMessage 
    });
  }
}
