import React, { useState } from 'react';
import { ExtractedData, CompanyData } from '@/lib/types/proposals';
import ProposalPdfTemplate from '@/components/proposals/pdf/ProposalPdfTemplate';
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
      toast({ title: 'Erro', description: 'Falha ao gerar PDF.', variant: 'destructive' });
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
          <div
            className={cn(
              'overflow-auto p-4 sm:p-6 lg:p-8',
              'flex justify-center',
              'min-h-[600px] max-h-[80vh]',
            )}
          >
            <div
              style={{
                transformOrigin: 'top center',
                transform: 'scale(0.78)',
                width: '794px',
                marginBottom: '-22%',
              }}
              className="shadow-2xl rounded-md overflow-hidden bg-white"
            >
              <ProposalPdfTemplate
                data={formData}
                companyData={companyData}
                showWatermark={formData.showWatermark !== 'false'}
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <OptionsSidebar formData={formData} onInputChange={onInputChange} />
      </div>
    </div>
  );
};

export default ProposalPreviewLayout;
