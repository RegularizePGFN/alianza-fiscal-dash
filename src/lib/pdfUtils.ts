
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
      svg { 
        vertical-align: middle !important; 
        display: inline-block !important;
        position: relative !important;
        top: -1px !important;
      }
      .mr-1 { margin-right: 4px !important; }
      .mr-2 { margin-right: 8px !important; }
      .print\\:hidden { display: none !important; }
      .text-xs { font-size: 10px !important; }
      .text-sm { font-size: 12px !important; }
      .flex-shrink-0 { flex-shrink: 0 !important; }
      .items-center { align-items: center !important; }
      .items-start { align-items: flex-start !important; }
      .flex { display: flex !important; }
    `;
    
    clonedElement.appendChild(styleElement);
    
    // Adicionar ao DOM temporariamente, mas invisível
    clonedElement.style.position = 'absolute';
    clonedElement.style.left = '-9999px';
    clonedElement.style.top = '-9999px';
    document.body.appendChild(clonedElement);
    
    // Agora que o elemento está no DOM, podemos capturá-lo
    const canvas = await html2canvas(clonedElement, {
      scale: 2, // Balancear qualidade e tamanho do arquivo
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      onclone: (clonedDoc) => {
        // Ajustes adicionais no clone antes da captura
        const elementsToPdf = clonedDoc.querySelector('[ref="proposalElement"]') as HTMLElement;
        if (elementsToPdf) {
          const icons = elementsToPdf.querySelectorAll('svg');
          icons.forEach(icon => {
            icon.style.verticalAlign = 'middle';
            icon.style.display = 'inline-block';
            icon.style.position = 'relative';
            icon.style.top = '-1px';
          });
          
          // Garantir que os contêineres flex sejam renderizados corretamente
          const flexContainers = elementsToPdf.querySelectorAll('.flex');
          flexContainers.forEach(container => {
            (container as HTMLElement).style.display = 'flex';
          });
          
          // Garantir alinhamento correto
          const itemsCenter = elementsToPdf.querySelectorAll('.items-center');
          itemsCenter.forEach(item => {
            (item as HTMLElement).style.alignItems = 'center';
          });
          
          const itemsStart = elementsToPdf.querySelectorAll('.items-start');
          itemsStart.forEach(item => {
            (item as HTMLElement).style.alignItems = 'flex-start';
          });
          
          // Ajustar tamanho dos marcadores no alerta
          const bullets = elementsToPdf.querySelectorAll('.bg-amber-500.rounded-full');
          bullets.forEach(bullet => {
            (bullet as HTMLElement).style.flexShrink = '0';
          });
          
          const roundedElements = elementsToPdf.querySelectorAll('.rounded, .rounded-lg, .rounded-md');
          roundedElements.forEach(el => {
            (el as HTMLElement).style.borderRadius = '0';
          });
          
          const printHidden = elementsToPdf.querySelectorAll('.print\\:hidden');
          printHidden.forEach(el => {
            (el as HTMLElement).style.display = 'none';
          });
        }
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
    
    // Adicionar a imagem do elemento no PDF com margens apropriadas
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    
    // Se a imagem for maior que uma página, adicionar páginas adicionais
    if (imgHeight > pageHeight) {
      let heightLeft = imgHeight - pageHeight;
      let position = -pageHeight;
      
      while (heightLeft > 0) {
        position = position - pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
    }
    
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
