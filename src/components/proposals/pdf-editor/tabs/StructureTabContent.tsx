
import React from 'react';
import { SectionOrganizer } from "@/components/proposals/pdf-editor";
import { TemplateLayout } from "@/lib/types/proposals";

interface StructureTabContentProps {
  sections: string[];
  onChange: (sections: string[]) => void;
  layoutOptions: {
    showHeader: boolean;
    showLogo: boolean;
    showWatermark: boolean;
  };
  onLayoutOptionChange: (name: keyof Omit<TemplateLayout, "sections">, value: boolean) => void;
}

export const StructureTabContent = ({ 
  sections, 
  onChange, 
  layoutOptions, 
  onLayoutOptionChange 
}: StructureTabContentProps) => {
  return (
    <SectionOrganizer 
      sections={sections}
      onChange={onChange}
      layoutOptions={layoutOptions}
      onLayoutOptionChange={onLayoutOptionChange}
    />
  );
};
