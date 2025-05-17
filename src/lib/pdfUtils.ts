
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { ExtractedData } from './types/proposals';

// Função auxiliar para formatar valores antes de exibir no PDF
const formatValue = (value: string | undefined): string => {
  if (!value || value === '0' || value === '0,00') return '-';
  return value.includes('R$') ? value : `R$ ${value}`;
};

export async function generateProposalPdf(proposalElement: HTMLElement, data: Partial<ExtractedData>): Promise<void> {
  try {
    // Aplicar estilos temporários para melhorar PDF
    const elementsWithBorderRadius = proposalElement.querySelectorAll('.rounded-lg, .rounded-md');
    const originalStyles: { element: Element; borderRadius: string }[] = [];
    
    // Remover bordas arredondadas temporariamente
    elementsWithBorderRadius.forEach(element => {
      const computedStyle = window.getComputedStyle(element);
      originalStyles.push({
        element,
        borderRadius: computedStyle.borderRadius
      });
      (element as HTMLElement).style.borderRadius = '0';
    });
    
    // Ajustar alinhamento de ícones temporariamente
    const iconElements = proposalElement.querySelectorAll('.mr-1, .mr-2');
    const iconOriginalStyles: { element: Element; marginRight: string; verticalAlign: string }[] = [];
    
    iconElements.forEach(element => {
      const computedStyle = window.getComputedStyle(element);
      iconOriginalStyles.push({
        element,
        marginRight: computedStyle.marginRight,
        verticalAlign: computedStyle.verticalAlign
      });
      (element as HTMLElement).style.marginRight = '8px';
      (element as HTMLElement).style.verticalAlign = 'middle';
      (element as HTMLElement).style.display = 'inline-block';
    });
    
    // Capturar o elemento como imagem com melhor qualidade
    const canvas = await html2canvas(proposalElement, {
      scale: 3, // Maior qualidade
      useCORS: true, // Permite imagens cross-origin
      logging: false, // Desativa logs de debug
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    
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
    
    // Restaurar estilos originais
    originalStyles.forEach(item => {
      (item.element as HTMLElement).style.borderRadius = item.borderRadius;
    });
    
    iconOriginalStyles.forEach(item => {
      (item.element as HTMLElement).style.marginRight = item.marginRight;
      (item.element as HTMLElement).style.verticalAlign = item.verticalAlign;
    });
    
    return Promise.resolve();
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    return Promise.reject(error);
  }
}
