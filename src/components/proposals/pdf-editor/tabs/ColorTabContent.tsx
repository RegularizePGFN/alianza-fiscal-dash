
import React from 'react';
import { ColorSelector } from "@/components/proposals/pdf-editor";
import { TemplateColors } from "@/lib/types/proposals";

interface ColorTabContentProps {
  colors: TemplateColors;
  onChange: (name: keyof TemplateColors, value: string) => void;
}

export const ColorTabContent = ({ 
  colors, 
  onChange 
}: ColorTabContentProps) => {
  return (
    <ColorSelector colors={colors} onChange={onChange} />
  );
};
