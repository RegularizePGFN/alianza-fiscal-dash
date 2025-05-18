
import React, { useState, useEffect } from 'react';
import { ExtractedData } from '@/lib/types/proposals';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowDown, ArrowUp, FileText, Briefcase, CreditCard, DollarSign, Calendar, Check, RefreshCw } from 'lucide-react';

interface SectionOrganizerProps {
  formData: Partial<ExtractedData>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  defaultSections: string[];
}

const SectionOrganizer = ({ 
  formData, 
  onInputChange,
  defaultSections
}: SectionOrganizerProps) => {
  // Section definitions with readable names
  const sectionDefinitions: Record<string, { name: string; icon: React.ReactNode }> = {
    client: { 
      name: 'Dados do Contribuinte', 
      icon: <Briefcase className="h-4 w-4" /> 
    },
    debt: { 
      name: 'Dados da Negociação', 
      icon: <DollarSign className="h-4 w-4" /> 
    },
    payment: { 
      name: 'Opções de Pagamento', 
      icon: <CreditCard className="h-4 w-4" /> 
    },
    fees: { 
      name: 'Custos e Honorários', 
      icon: <Calendar className="h-4 w-4" /> 
    },
    metadata: { 
      name: 'Informações de Data/Hora', 
      icon: <FileText className="h-4 w-4" /> 
    }
  };
  
  const [sections, setSections] = useState<string[]>(defaultSections);
  const [showHeader, setShowHeader] = useState(true);
  const [showLogo, setShowLogo] = useState(true);
  const [showWatermark, setShowWatermark] = useState(false);
  
  // Update local state when formData changes
  useEffect(() => {
    if (formData.templateLayout && typeof formData.templateLayout === 'string') {
      try {
        const layout = JSON.parse(formData.templateLayout);
        if (layout.sections) setSections(layout.sections);
        if (layout.showHeader !== undefined) setShowHeader(layout.showHeader);
        if (layout.showLogo !== undefined) setShowLogo(layout.showLogo);
        if (layout.showWatermark !== undefined) setShowWatermark(layout.showWatermark);
      } catch (e) {
        console.error('Failed to parse template layout', e);
        resetLayout();
      }
    } else {
      resetLayout();
    }
  }, [formData.templateLayout]);
  
  const resetLayout = () => {
    setSections(defaultSections);
    setShowHeader(true);
    setShowLogo(true);
    setShowWatermark(false);
    
    updateLayoutInFormData(defaultSections, true, true, false);
  };
  
  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    if (direction === 'up' && index > 0) {
      [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
    } else if (direction === 'down' && index < newSections.length - 1) {
      [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
    }
    
    setSections(newSections);
    updateLayoutInFormData(newSections, showHeader, showLogo, showWatermark);
  };
  
  const toggleOption = (option: 'header' | 'logo' | 'watermark', value: boolean) => {
    if (option === 'header') {
      setShowHeader(value);
      updateLayoutInFormData(sections, value, showLogo, showWatermark);
    } else if (option === 'logo') {
      setShowLogo(value);
      updateLayoutInFormData(sections, showHeader, value, showWatermark);
    } else if (option === 'watermark') {
      setShowWatermark(value);
      updateLayoutInFormData(sections, showHeader, showLogo, value);
    }
  };
  
  const updateLayoutInFormData = (
    newSections: string[], 
    headerVisible: boolean, 
    logoVisible: boolean, 
    watermarkVisible: boolean
  ) => {
    const event = {
      target: {
        name: 'templateLayout',
        value: JSON.stringify({
          sections: newSections,
          showHeader: headerVisible,
          showLogo: logoVisible,
          showWatermark: watermarkVisible
        })
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onInputChange(event);
  };
  
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium">Organização das Seções</h3>
        <p className="text-xs text-slate-500">
          Arraste para reordenar as seções da proposta
        </p>
      </div>
      
      <div className="space-y-2">
        {sections.map((section, index) => (
          <Card key={index} className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-slate-100 rounded p-1">
                {sectionDefinitions[section]?.icon || <FileText className="h-4 w-4" />}
              </div>
              <span className="text-sm font-medium">
                {sectionDefinitions[section]?.name || section}
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={() => moveSection(index, 'up')}
                disabled={index === 0}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={() => moveSection(index, 'down')}
                disabled={index === sections.length - 1}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
      
      <div className="pt-4 border-t space-y-4">
        <h4 className="text-sm font-medium">Opções de Exibição</h4>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="show-header" className="cursor-pointer">Mostrar cabeçalho</Label>
          <Switch 
            id="show-header" 
            checked={showHeader}
            onCheckedChange={(checked) => toggleOption('header', checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="show-logo" className="cursor-pointer">Mostrar logo</Label>
          <Switch 
            id="show-logo" 
            checked={showLogo}
            onCheckedChange={(checked) => toggleOption('logo', checked)}
            disabled={!showHeader}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="show-watermark" className="cursor-pointer">Mostrar marca d'água</Label>
          <Switch 
            id="show-watermark" 
            checked={showWatermark}
            onCheckedChange={(checked) => toggleOption('watermark', checked)}
          />
        </div>
      </div>
      
      <div className="pt-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={resetLayout}
          className="w-full"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Restaurar layout original
        </Button>
      </div>
    </div>
  );
};

export default SectionOrganizer;
