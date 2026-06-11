import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText } from 'lucide-react';
import { Proposal } from '@/lib/types/proposals';
import ProposalPdfTemplate from '@/components/proposals/pdf/ProposalPdfTemplate';
import AliancaPdfTemplate from '@/components/proposals/pdf/AliancaPdfTemplate';
import { DEFAULT_PDF_TEMPLATE, type PdfTemplateId } from '@/components/proposals/pdf/templates';
import ResponsivePdfPreview from '@/components/proposals/preview/ResponsivePdfPreview';
import { generateProposalPdf } from '@/lib/pdf/generatePdf';
import { useToast } from '@/hooks/use-toast';

interface Props {
  proposal: Proposal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProposalPreviewDialog: React.FC<Props> = ({ proposal, open, onOpenChange }) => {
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);

  const data = proposal?.data;
  const template = (data?.pdfTemplate as PdfTemplateId) || DEFAULT_PDF_TEMPLATE;

  const handleDownload = async () => {
    if (!data) return;
    try {
      setDownloading(true);
      toast({ title: 'Gerando PDF', description: 'Aguarde alguns segundos...' });
      await generateProposalPdf(null, data, null);
      toast({ title: 'PDF gerado!', description: 'Download iniciado.' });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Falha ao gerar PDF.';
      toast({ title: 'Erro', description: message, variant: 'destructive' });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] max-w-[1100px] max-h-[92vh] overflow-hidden p-0 flex flex-col">
        <DialogHeader className="p-4 sm:p-5 pb-3 border-b">
          <div className="flex items-start justify-between gap-3 pr-8">
            <div className="flex items-start gap-2">
              <div className="rounded-md bg-primary/10 p-2 text-primary">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-base">
                  {data?.clientName || 'Proposta'}
                </DialogTitle>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {data?.cnpj && (
                    <Badge variant="secondary" className="text-[10px]">
                      CNPJ {data.cnpj}
                    </Badge>
                  )}
                  {proposal?.userName && (
                    <Badge variant="outline" className="text-[10px]">
                      Vendedor: {proposal.userName}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-[10px]">
                    {template === 'alianca' ? 'Modelo Aliança' : 'Modelo clássico'}
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              size="sm"
              onClick={handleDownload}
              disabled={downloading || !data}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <Download className="h-4 w-4" />
              {downloading ? 'Gerando PDF...' : 'Baixar PDF'}
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto bg-muted/30 p-4 sm:p-6">
          {data && (
            <ResponsivePdfPreview maxWidth={900}>
              {template === 'alianca' ? (
                <AliancaPdfTemplate data={data} companyData={null} />
              ) : (
                <ProposalPdfTemplate
                  data={data}
                  companyData={null}
                  showWatermark={data.showWatermark !== 'false'}
                />
              )}
            </ResponsivePdfPreview>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProposalPreviewDialog;
