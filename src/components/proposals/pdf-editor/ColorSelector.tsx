
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette } from "lucide-react";

export interface TemplateColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
}

export interface ColorSelectorProps {
  colors: TemplateColors;
  onChange: (name: keyof TemplateColors, value: string) => void;
}

const ColorSelector = ({ colors, onChange }: ColorSelectorProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <Palette className="h-4 w-4 mr-2 text-gray-500" />
          Customizar Cores
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="primary-color" className="flex items-center justify-between">
            <span>Cor Primária</span>
            <div 
              className="h-4 w-4 rounded-full border" 
              style={{ backgroundColor: colors.primary }}
            />
          </Label>
          <Input 
            id="primary-color" 
            type="color" 
            value={colors.primary} 
            onChange={(e) => onChange('primary', e.target.value)} 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="secondary-color" className="flex items-center justify-between">
            <span>Cor Secundária</span>
            <div 
              className="h-4 w-4 rounded-full border" 
              style={{ backgroundColor: colors.secondary }}
            />
          </Label>
          <Input 
            id="secondary-color" 
            type="color" 
            value={colors.secondary} 
            onChange={(e) => onChange('secondary', e.target.value)} 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="accent-color" className="flex items-center justify-between">
            <span>Cor de Destaque</span>
            <div 
              className="h-4 w-4 rounded-full border" 
              style={{ backgroundColor: colors.accent }}
            />
          </Label>
          <Input 
            id="accent-color" 
            type="color" 
            value={colors.accent} 
            onChange={(e) => onChange('accent', e.target.value)} 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="background-color" className="flex items-center justify-between">
            <span>Cor de Fundo</span>
            <div 
              className="h-4 w-4 rounded-full border" 
              style={{ backgroundColor: colors.background }}
            />
          </Label>
          <Input 
            id="background-color" 
            type="color" 
            value={colors.background} 
            onChange={(e) => onChange('background', e.target.value)} 
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ColorSelector;
