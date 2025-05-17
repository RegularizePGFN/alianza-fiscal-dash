
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ExtractedData } from './types/proposals';
import { formatCurrency } from './utils';

// Função auxiliar para formatar valores antes de exibir no PDF
const formatValue = (value: string | undefined): string => {
  if (!value || value === '0' || value === '0,00') return '-';
  return value.includes('R$') ? value : `R$ ${value}`;
};

export async function generateProposalPdf(proposalElement: HTMLElement, data: Partial<ExtractedData>): Promise<void> {
  try {
    // Capturar o elemento como imagem
    const canvas = await html2canvas(proposalElement, {
      scale: 2, // Melhor qualidade
      useCORS: true, // Permite imagens cross-origin
      logging: false, // Desativa logs de debug
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
    const imgHeight = canvas.height * imgWidth / canvas.width;
    
    // Adicionar a imagem do elemento no PDF
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    
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
