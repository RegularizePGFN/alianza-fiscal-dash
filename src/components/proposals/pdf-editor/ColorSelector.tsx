import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ExtractedData, PDFTemplate, TemplateColors } from '@/lib/types/proposals';
import { Palette, RefreshCw } from 'lucide-react';

interface ColorSelectorProps {
  formData: Partial<ExtractedData>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedTemplate: PDFTemplate;
}

const ColorSelector = ({ 
  formData, 
  onInputChange, 
  selectedTemplate 
}: ColorSelectorProps) => {
  const [colors, setColors] = useState<TemplateColors>({
    primary: selectedTemplate.primaryColor,
    secondary: selectedTemplate.secondaryColor,
    accent: selectedTemplate.accentColor,
    background: selectedTemplate.backgroundColor
  });

  // Update colors when template changes
  useEffect(() => {
    if (formData.templateColors && typeof formData.templateColors === 'string') {
      try {
        const parsedColors = JSON.parse(formData.templateColors) as TemplateColors;
        setColors({
          primary: parsedColors.primary || selectedTemplate.primaryColor,
          secondary: parsedColors.secondary || selectedTemplate.secondaryColor,
          accent: parsedColors.accent || selectedTemplate.accentColor,
          background: parsedColors.background || selectedTemplate.backgroundColor
        });
      } catch (e) {
        console.error('Failed to parse template colors', e);
        resetColors();
      }
    } else {
      resetColors();
    }
  }, [formData.templateColors, selectedTemplate]);

  const resetColors = () => {
    setColors({
      primary: selectedTemplate.primaryColor,
      secondary: selectedTemplate.secondaryColor,
      accent: selectedTemplate.accentColor,
      background: selectedTemplate.backgroundColor
    });
    
    updateColorsInFormData({
      primary: selectedTemplate.primaryColor,
      secondary: selectedTemplate.secondaryColor,
      accent: selectedTemplate.accentColor,
      background: selectedTemplate.backgroundColor
    });
  };

  const handleColorChange = (colorKey: keyof TemplateColors, value: string) => {
    const newColors = { ...colors, [colorKey]: value };
    setColors(newColors);
    updateColorsInFormData(newColors);
  };

  const updateColorsInFormData = (newColors: TemplateColors) => {
    const event = {
      target: {
        name: 'templateColors',
        value: JSON.stringify(newColors)
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onInputChange(event);
  };

  // Color presets
  const colorPresets = [
    { primary: '#3B82F6', secondary: '#1E40AF', accent: '#10B981' },
    { primary: '#8B5CF6', secondary: '#6D28D9', accent: '#EC4899' },
    { primary: '#EC4899', secondary: '#DB2777', accent: '#8B5CF6' },
    { primary: '#10B981', secondary: '#047857', accent: '#3B82F6' },
    { primary: '#F97316', secondary: '#C2410C', accent: '#10B981' },
    { primary: '#6366F1', secondary: '#4F46E5', accent: '#F97316' },
  ];

  const applyPreset = (preset: any) => {
    const newColors = { 
      ...colors, 
      primary: preset.primary, 
      secondary: preset.secondary, 
      accent: preset.accent 
    };
    setColors(newColors);
    updateColorsInFormData(newColors);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium">Cores da Proposta</h3>
        <p className="text-xs text-slate-500">
          Personalize as cores dos elementos da proposta
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs">Cor Primária (Títulos e Cabeçalhos)</Label>
          <div className="flex gap-2">
            <div 
              className="w-10 h-10 rounded border"
              style={{ backgroundColor: colors.primary }}
            ></div>
            <Input
              type="text"
              value={colors.primary}
              onChange={(e) => handleColorChange('primary', e.target.value)}
              className="flex-1"
            />
            <Input
              type="color"
              value={colors.primary}
              onChange={(e) => handleColorChange('primary', e.target.value)}
              className="w-10 h-10 p-1 cursor-pointer"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label className="text-xs">Cor Secundária (Ícones e Detalhes)</Label>
          <div className="flex gap-2">
            <div 
              className="w-10 h-10 rounded border"
              style={{ backgroundColor: colors.secondary }}
            ></div>
            <Input
              type="text"
              value={colors.secondary}
              onChange={(e) => handleColorChange('secondary', e.target.value)}
              className="flex-1"
            />
            <Input
              type="color"
              value={colors.secondary}
              onChange={(e) => handleColorChange('secondary', e.target.value)}
              className="w-10 h-10 p-1 cursor-pointer"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label className="text-xs">Cor de Destaque (Destaques e Economia)</Label>
          <div className="flex gap-2">
            <div 
              className="w-10 h-10 rounded border"
              style={{ backgroundColor: colors.accent }}
            ></div>
            <Input
              type="text"
              value={colors.accent}
              onChange={(e) => handleColorChange('accent', e.target.value)}
              className="flex-1"
            />
            <Input
              type="color"
              value={colors.accent}
              onChange={(e) => handleColorChange('accent', e.target.value)}
              className="w-10 h-10 p-1 cursor-pointer"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label className="text-xs">Cor de Fundo</Label>
          <div className="flex gap-2">
            <div 
              className="w-10 h-10 rounded border"
              style={{ backgroundColor: colors.background }}
            ></div>
            <Input
              type="text"
              value={colors.background}
              onChange={(e) => handleColorChange('background', e.target.value)}
              className="flex-1"
            />
            <Input
              type="color"
              value={colors.background}
              onChange={(e) => handleColorChange('background', e.target.value)}
              className="w-10 h-10 p-1 cursor-pointer"
            />
          </div>
        </div>
      </div>
      
      <div className="pt-4 border-t">
        <Label className="text-xs mb-2 block">Combinações predefinidas</Label>
        <div className="grid grid-cols-3 gap-2">
          {colorPresets.map((preset, index) => (
            <button
              key={index}
              onClick={() => applyPreset(preset)}
              className="h-8 rounded border overflow-hidden"
              style={{
                background: `linear-gradient(to right, ${preset.primary} 33%, ${preset.secondary} 33% 66%, ${preset.accent} 66%)`
              }}
            ></button>
          ))}
        </div>
      </div>
      
      <div className="pt-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={resetColors}
          className="w-full"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Restaurar cores originais
        </Button>
      </div>
    </div>
  );
};

export default ColorSelector;
