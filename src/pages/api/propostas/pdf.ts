import { ExtractedData } from './types/proposals';

export async function generateProposalPdf(proposalElement: HTMLElement, data: Partial<ExtractedData>): Promise<void> {
  try {
    const specialist = data.specialistName
      ? data.specialistName.replace(/[^\w]/g, '_').toLowerCase()
      : 'especialista';

    const fileName = `proposta_pgfn_${data.cnpj?.replace(/\D/g, '') || 'cliente'}_${specialist}.pdf`;

    const clonedElement = proposalElement.cloneNode(true) as HTMLElement;

    const elementsToRemove = clonedElement.querySelectorAll('.pdf-action-buttons, [data-pdf-remove="true"], button');
    elementsToRemove.forEach(element => {
      if (element instanceof HTMLElement) {
        element.style.display = 'none';
      }
    });

    const htmlContent = clonedElement.outerHTML;

    const styleSheets = Array.from(document.styleSheets);
    let styles = '';

    styleSheets.forEach(sheet => {
      try {
        if (sheet.cssRules) {
          const cssRules = Array.from(sheet.cssRules);
          cssRules.forEach(rule => {
            styles += rule.cssText + '\n';
          });
        }
      } catch (e) {
        console.warn('Could not access stylesheet rules:', e);
      }
    });

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
            font-size: 12px;
          }
          ${styles}
          .preview-proposal {
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
            page-break-inside: avoid;
          }
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
          .grid > div {
            padding: 0.75rem !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          section, .card, .bg-gradient-to-r {
            page-break-inside: avoid;
          }
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
      let errorMessage = 'Erro desconhecido ao gerar o PDF';
      try {
        const errorData = await response.json();
        errorMessage = errorData.details || errorData.error || response.statusText;
      } catch (err) {
        try {
          const text = await response.text();
          console.warn('Resposta inesperada da API:', text);
          errorMessage = text || response.statusText || `Erro ${response.status}`;
        } catch (textErr) {
          console.error('Erro ao ler resposta como texto:', textErr);
          errorMessage = response.statusText || `Erro ${response.status}`;
        }
      }
      throw new Error(`API error: ${errorMessage}`);
    }

    console.log('PDF generated successfully, creating download...');

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();

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
