import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ExtractedData, CompanyData } from '@/lib/types/proposals';
import ProposalPdfTemplate from '@/components/proposals/pdf/ProposalPdfTemplate';
import AliancaPdfTemplate from '@/components/proposals/pdf/AliancaPdfTemplate';
import { DEFAULT_PDF_TEMPLATE, type PdfTemplateId } from '@/components/proposals/pdf/templates';
import { Button } from '@/components/ui/button';
import { Download, RotateCcw, Edit2, Eye } from 'lucide-react';
import { generateProposalPdf } from '@/lib/pdf/generatePdf';
import { useToast } from '@/hooks/use-toast';
import OptionsSidebar from './OptionsSidebar';
import { cn } from '@/lib/utils';

interface ProposalPreviewLayoutProps {
  formData: Partial<ExtractedData>;
  companyData?: CompanyData | null;
  onInputChange: (name: string, value: string) => void;
  onReset: () => void;
  onToggleEdit: () => void;
  isEditing: boolean;
}

const ProposalPreviewLayout: React.FC<ProposalPreviewLayoutProps> = ({
  formData,
  companyData,
  onInputChange,
  onReset,
  onToggleEdit,
  isEditing,
}) => {
  const { toast } = useToast();
  const [downloading, setDownloading] = useState<'pdf' | null>(null);

  const handleDownloadPdf = async () => {
    try {
      setDownloading('pdf');
      toast({ title: 'Gerando PDF', description: 'Aguarde alguns segundos...' });
      await generateProposalPdf(null, formData, companyData);
      toast({ title: 'PDF gerado!', description: 'Download iniciado.' });
    } catch (e) {
      console.error(e);
      const message = e instanceof Error ? e.message : 'Falha ao gerar PDF.';
      toast({ title: 'Erro', description: message, variant: 'destructive' });
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="rounded-xl border bg-card shadow-sm p-3 flex flex-wrap items-center justify-between gap-3 sticky top-2 z-20">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onToggleEdit} className="gap-2">
            {isEditing ? <Eye className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
            {isEditing ? 'Visualizar' : 'Editar dados'}
          </Button>
          <Button variant="ghost" size="sm" onClick={onReset} className="gap-2 text-muted-foreground">
            <RotateCcw className="h-4 w-4" />
            Nova proposta
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleDownloadPdf}
            disabled={!!downloading}
            className="gap-2 bg-primary hover:bg-primary/90 shadow-md"
          >
            <Download className="h-4 w-4" />
            {downloading === 'pdf' ? 'Gerando PDF...' : 'Baixar PDF'}
          </Button>
        </div>
      </div>

      {/* Two columns */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        {/* Preview */}
        <div className="rounded-xl border bg-muted/30 shadow-inner overflow-hidden">
          <div className="px-4 py-2 border-b bg-card flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pré-visualização
            </span>
            <span className="text-[10px] text-muted-foreground">A4 • 210 × 297 mm</span>
          </div>
          <div className="p-4 sm:p-6 lg:p-8 flex justify-center">
            <ResponsivePdfPreview>
              {((formData.pdfTemplate as PdfTemplateId) || DEFAULT_PDF_TEMPLATE) === 'alianca' ? (
                <AliancaPdfTemplate data={formData} companyData={companyData} />
              ) : (
                <ProposalPdfTemplate
                  data={formData}
                  companyData={companyData}
                  showWatermark={formData.showWatermark !== 'false'}
                />
              )}
            </ResponsivePdfPreview>
          </div>
        </div>

        {/* Sidebar */}
        <OptionsSidebar formData={formData} onInputChange={onInputChange} />
      </div>
    </div>
  );
};

/**
 * Renderiza o template do PDF (794 × 1123 px, A4) escalado responsivamente
 * para caber 100% na largura disponível, sem cortar conteúdo em nenhum nível
 * de zoom da página. O wrapper externo reserva exatamente a altura escalada.
 */
const ResponsivePdfPreview: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const PAGE_W = 794;
  const PAGE_H = 1123;
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const update = () => {
      const w = containerRef.current?.clientWidth || PAGE_W;
      const next = Math.min(1, w / PAGE_W);
      setScale(next);
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full" style={{ maxWidth: `${PAGE_W}px` }}>
      <div style={{ width: '100%', height: `${PAGE_H * scale}px`, position: 'relative' }}>
        <div
          ref={innerRef}
          style={{
            width: `${PAGE_W}px`,
            height: `${PAGE_H}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            position: 'absolute',
            top: 0,
            left: 0,
            background: '#fff',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1)',
            borderRadius: '6px',
            overflow: 'hidden',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default ProposalPreviewLayout;
