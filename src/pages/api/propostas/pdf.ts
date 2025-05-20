
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

    console.log('Starting PDF generation process...');

    // Launch a new browser instance with proper settings
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    console.log('Browser launched successfully');
    
    const page = await browser.newPage();
    
    // Set the content and wait for network idle (ensure all resources are loaded)
    await page.setContent(html, { waitUntil: 'networkidle0' });
    console.log('Content loaded in browser page');
    
    // Set viewport to A4 size with better scaling for higher quality
    await page.setViewport({
      width: 794, // A4 width in px at 96 dpi
      height: 1123, // A4 height in px at 96 dpi
      deviceScaleFactor: 2, // Higher for better quality
    });
    
    // Generate PDF with specific settings for A4 size and proper margins
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
    
    console.log('PDF generated successfully');
    await browser.close();
    console.log('Browser closed');
    
    // Set appropriate headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    // Send the PDF buffer
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
}
