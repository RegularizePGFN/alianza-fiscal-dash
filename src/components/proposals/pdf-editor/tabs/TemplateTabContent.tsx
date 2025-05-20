
import React from 'react';
import { TemplateSelector } from "@/components/proposals/pdf-editor";
import { PDFTemplate } from "@/lib/types/proposals";

// Sample templates
const defaultTemplates: PDFTemplate[] = [
  {
    id: "classic",
    name: "Clássico",
    description: "Layout tradicional com cores corporativas",
    preview: "/lovable-uploads/ec1cbd63-b95a-4f6d-9ad9-1b03e468f446.png",
    primaryColor: "#3B82F6",
    secondaryColor: "#1E40AF",
    accentColor: "#10B981",
    backgroundColor: "#FFFFFF",
    defaultLayout: ["client", "debt", "payment", "fees", "total"]
  },
  {
    id: "modern",
    name: "Moderno",
    description: "Design contemporâneo com cores vibrantes",
    preview: "/lovable-uploads/ec1cbd63-b95a-4f6d-9ad9-1b03e468f446.png",
    primaryColor: "#8B5CF6",
    secondaryColor: "#6D28D9",
    accentColor: "#EC4899",
    backgroundColor: "#F8FAFC",
    defaultLayout: ["client", "alert", "debt", "payment", "fees"]
  },
  {
    id: "minimal",
    name: "Minimalista",
    description: "Design limpo e simplificado",
    preview: "/lovable-uploads/ec1cbd63-b95a-4f6d-9ad9-1b03e468f446.png",
    primaryColor: "#6B7280",
    secondaryColor: "#4B5563",
    accentColor: "#059669",
    backgroundColor: "#FFFFFF",
    defaultLayout: ["client", "debt", "payment", "fees"]
  }
];

interface TemplateTabContentProps {
  selectedTemplateId: string;
  onSelectTemplate: (template: PDFTemplate) => void;
}

export const TemplateTabContent = ({ 
  selectedTemplateId, 
  onSelectTemplate 
}: TemplateTabContentProps) => {
  return (
    <TemplateSelector 
      templates={defaultTemplates}
      selectedTemplateId={selectedTemplateId}
      onSelectTemplate={onSelectTemplate}
    />
  );
};
