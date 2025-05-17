
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { ExtractedData } from './types/proposals';

export async function generateProposalPdf(proposalElement: HTMLElement, data: Partial<ExtractedData>): Promise<void> {
  try {
    // Criar uma cópia do elemento para manipular sem afetar a UI original
    const clonedElement = proposalElement.cloneNode(true) as HTMLElement;
    
    // Aplicar estilos para impressão no clone
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .rounded-lg, .rounded-md, .rounded { border-radius: 0 !important; }
      svg { display: none !important; } /* Remove all icons */
      .mr-1, .mr-2 { margin-right: 4px !important; }
      .print\\:hidden { display: none !important; }
      .text-xs { font-size: 8px !important; }
      .text-sm { font-size: 10px !important; }
      .text-base { font-size: 11px !important; }
      .text-lg { font-size: 12px !important; }
      .text-xl { font-size: 13px !important; }
      .text-2xl { font-size: 14px !important; }
      .text-3xl { font-size: 16px !important; }
      
      /* More compact spacing */
      .p-1, .p-2, .p-3, .p-4, .p-5, .p-6 { padding: 4px !important; }
      .px-1, .px-2, .px-3, .px-4, .px-5, .px-6 { padding-left: 4px !important; padding-right: 4px !important; }
      .py-1, .py-2, .py-3, .py-4, .py-5, .py-6 { padding-top: 4px !important; padding-bottom: 4px !important; }
      .m-1, .m-2, .m-3, .m-4, .m-5, .m-6 { margin: 4px !important; }
      .mx-1, .mx-2, .mx-3, .mx-4, .mx-5, .mx-6 { margin-left: 4px !important; margin-right: 4px !important; }
      .my-1, .my-2, .my-3, .my-4, .my-5, .my-6 { margin-top: 4px !important; margin-bottom: 4px !important; }
      .gap-1, .gap-2, .gap-3, .gap-4, .gap-5, .gap-6 { gap: 4px !important; }
      .space-y-1, .space-y-2, .space-y-3, .space-y-4, .space-y-5, .space-y-6 { margin-top: 4px !important; margin-bottom: 4px !important; }
    `;
    
    clonedElement.appendChild(styleElement);
    
    // Adicionar ao DOM temporariamente, mas invisível
    clonedElement.style.position = 'absolute';
    clonedElement.style.left = '-9999px';
    clonedElement.style.top = '-9999px';
    clonedElement.style.width = '210mm'; // A4 width
    document.body.appendChild(clonedElement);
    
    // Agora que o elemento está no DOM, podemos capturá-lo
    const canvas = await html2canvas(clonedElement, {
      scale: 2, // Balancear qualidade e tamanho do arquivo
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: 595, // A4 width in points at 72dpi
      height: 842, // A4 height in points at 72dpi
      onclone: (clonedDoc) => {
        // Remove all SVG icons to save space
        const icons = clonedDoc.querySelectorAll('svg');
        icons.forEach(icon => {
          icon.style.display = 'none';
        });
        
        // Make text smaller
        const textElements = clonedDoc.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6');
        textElements.forEach(el => {
          const element = el as HTMLElement;
          if (element.classList.contains('text-xs')) {
            element.style.fontSize = '8px';
          } else if (element.classList.contains('text-sm')) {
            element.style.fontSize = '9px';
          } else if (element.classList.contains('text-base')) {
            element.style.fontSize = '10px';
          } else if (element.classList.contains('text-lg')) {
            element.style.fontSize = '11px';
          } else if (element.classList.contains('text-xl')) {
            element.style.fontSize = '12px';
          } else if (element.classList.contains('text-2xl')) {
            element.style.fontSize = '13px';
          } else if (element.classList.contains('text-3xl')) {
            element.style.fontSize = '14px';
          } else {
            element.style.fontSize = '10px';
          }
        });
        
        // Make padding/margins smaller
        const allElements = clonedDoc.querySelectorAll('*');
        allElements.forEach(el => {
          const element = el as HTMLElement;
          
          // Replace padding
          if (element.style.padding) element.style.padding = '4px';
          if (element.style.paddingTop) element.style.paddingTop = '2px';
          if (element.style.paddingBottom) element.style.paddingBottom = '2px';
          if (element.style.paddingLeft) element.style.paddingLeft = '4px';
          if (element.style.paddingRight) element.style.paddingRight = '4px';
          
          // Replace margins
          if (element.style.margin) element.style.margin = '2px';
          if (element.style.marginTop) element.style.marginTop = '2px';
          if (element.style.marginBottom) element.style.marginBottom = '2px';
          if (element.style.marginLeft) element.style.marginLeft = '2px';
          if (element.style.marginRight) element.style.marginRight = '2px';
        });
        
        // Remove action buttons
        const buttons = clonedDoc.querySelectorAll('button');
        buttons.forEach(button => {
          button.style.display = 'none';
        });
      }
    });
    
    // Remover o clone após a captura
    document.body.removeChild(clonedElement);
    
    const imgData = canvas.toDataURL('image/png');
    
    // Criar um novo PDF no tamanho A4
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Calcular proporções para ajustar a imagem ao PDF
    const imgWidth = 210; // A4 width in mm (210mm)
    const pageHeight = 297; // A4 height in mm
    const imgHeight = canvas.height * imgWidth / canvas.width;
    
    // Forçar a imagem a estar em uma única página
    let finalImgHeight = Math.min(imgHeight, pageHeight);
    
    // Adicionar a imagem do elemento no PDF com margens apropriadas
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, finalImgHeight);
    
    // Nome do arquivo
    const fileName = `proposta_pgfn_${data.cnpj?.replace(/[^\d]/g, '') || 'cliente'}.pdf`;
    
    // Fazer o download do PDF
    pdf.save(fileName);
    
    return Promise.resolve();
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    return Promise.reject(error);
  }
}
