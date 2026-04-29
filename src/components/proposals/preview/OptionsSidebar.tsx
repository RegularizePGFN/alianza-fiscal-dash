import React from 'react';
import { ExtractedData } from '@/lib/types/proposals';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { FileText, User, Palette } from 'lucide-react';

interface OptionsSidebarProps {
  formData: Partial<ExtractedData>;
  onInputChange: (name: string, value: string) => void;
}

const OptionsSidebar: React.FC<OptionsSidebarProps> = ({ formData, onInputChange }) => {
  const showObservations = !!formData.additionalComments;
  const includeExecutive = formData.includeExecutiveData === 'true';
  const showWatermark = formData.showWatermark !== 'false';
  const showFeesInstallments = formData.showFeesInstallments === 'true';

  return (
    <Card className="border-border shadow-sm h-fit lg:sticky lg:top-20">
      <CardContent className="p-4">
        <div className="mb-3">
          <h3 className="text-sm font-semibold">Personalizar proposta</h3>
          <p className="text-xs text-muted-foreground">Ajustes refletem na pré-visualização e no PDF</p>
        </div>

        <Accordion type="multiple" defaultValue={['obs']} className="w-full">
          {/* Observações */}
          <AccordionItem value="obs">
            <AccordionTrigger className="text-sm">
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Observações
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="showObs" className="text-xs">Incluir observações</Label>
                <Switch
                  id="showObs"
                  checked={showObservations}
                  onCheckedChange={(c) => {
                    if (!c) onInputChange('additionalComments', '');
                    else if (!formData.additionalComments) onInputChange('additionalComments', ' ');
                  }}
                />
              </div>
              {showObservations && (
                <Textarea
                  value={formData.additionalComments || ''}
                  onChange={(e) => onInputChange('additionalComments', e.target.value)}
                  placeholder="Ex.: condições especiais, próximos passos..."
                  className="h-24 text-sm"
                />
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Executivo */}
          <AccordionItem value="exec">
            <AccordionTrigger className="text-sm">
              <span className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Especialista responsável
              </span>
            </AccordionTrigger>
            <AccordionContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="incExec" className="text-xs">Mostrar no rodapé</Label>
                <Switch
                  id="incExec"
                  checked={includeExecutive}
                  onCheckedChange={(c) => onInputChange('includeExecutiveData', c ? 'true' : 'false')}
                />
              </div>
              {includeExecutive && (
                <div className="space-y-2">
                  <div>
                    <Label className="text-xs">Nome</Label>
                    <Input
                      value={formData.executiveName || ''}
                      onChange={(e) => onInputChange('executiveName', e.target.value)}
                      placeholder="Nome completo"
                      className="h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">E-mail</Label>
                    <Input
                      value={formData.executiveEmail || ''}
                      onChange={(e) => onInputChange('executiveEmail', e.target.value)}
                      placeholder="email@aliancafiscal.com"
                      type="email"
                      className="h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Telefone (opcional)</Label>
                    <Input
                      value={formData.executivePhone || ''}
                      onChange={(e) => onInputChange('executivePhone', e.target.value)}
                      placeholder="(00) 00000-0000"
                      className="h-9"
                    />
                  </div>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Aparência */}
          <AccordionItem value="apr">
            <AccordionTrigger className="text-sm">
              <span className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                Aparência do PDF
              </span>
            </AccordionTrigger>
            <AccordionContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs">Marca d'água Aliança Fiscal</Label>
                  <p className="text-[10px] text-muted-foreground">Sutil ao fundo do documento</p>
                </div>
                <Switch
                  checked={showWatermark}
                  onCheckedChange={(c) => onInputChange('showWatermark', c ? 'true' : 'false')}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs">Mostrar honorários parcelados</Label>
                  <p className="text-[10px] text-muted-foreground">
                    Exibe a opção parcelada quando disponível
                  </p>
                </div>
                <Switch
                  checked={showFeesInstallments}
                  onCheckedChange={(c) => onInputChange('showFeesInstallments', c ? 'true' : 'false')}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default OptionsSidebar;
