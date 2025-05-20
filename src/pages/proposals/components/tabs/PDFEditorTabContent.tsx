
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EditorTabs, ProposalPreviewContainer } from '@/components/proposals/pdf-editor';
import { ExtractedData, PDFTemplate, CompanyData, TemplateColors, TemplateLayout } from '@/lib/types/proposals';
import { useAuth } from '@/contexts/auth';
import { useUsers } from '@/hooks/useUsers';

// Default template
const DEFAULT_TEMPLATE: PDFTemplate = {
  id: 'default',
  name: 'Estilo Padrão',
  description: 'Modelo de proposta com cores padrão',
  preview: '/template-previews/default.png',
  primaryColor: '#3B82F6',
  secondaryColor: '#1E40AF',
  accentColor: '#10B981',
  backgroundColor: '#F8FAFC',
  defaultLayout: ['company', 'debt', 'payment', 'fees', 'total']
};

interface PDFEditorTabContentProps {
  formData: Partial<ExtractedData>;
  onInputChange: (name: string, value: string) => void;
  onGenerateProposal: () => Promise<void>;
  imagePreview: string | null;
  companyData?: CompanyData | null;
}

const PDFEditorTabContent = ({ 
  formData, 
  onInputChange, 
  onGenerateProposal,
  imagePreview,
  companyData
}: PDFEditorTabContentProps) => {
  const { user } = useAuth();
  const { users } = useUsers();
  const [activeTab, setActiveTab] = useState('preview');
  const [selectedTemplate, setSelectedTemplate] = useState<PDFTemplate>(DEFAULT_TEMPLATE);
  const [selectedSpecialist, setSelectedSpecialist] = useState(user?.id || '');
  
  // Parse template colors
  const [colors, setColors] = useState<TemplateColors>(() => {
    try {
      return formData.templateColors ? JSON.parse(formData.templateColors) : {
        primary: DEFAULT_TEMPLATE.primaryColor,
        secondary: DEFAULT_TEMPLATE.secondaryColor,
        accent: DEFAULT_TEMPLATE.accentColor,
        background: DEFAULT_TEMPLATE.backgroundColor
      };
    } catch (e) {
      return {
        primary: DEFAULT_TEMPLATE.primaryColor,
        secondary: DEFAULT_TEMPLATE.secondaryColor,
        accent: DEFAULT_TEMPLATE.accentColor,
        background: DEFAULT_TEMPLATE.backgroundColor
      };
    }
  });
  
  // Parse template layout
  const [layout, setLayout] = useState<TemplateLayout>(() => {
    try {
      return formData.templateLayout ? JSON.parse(formData.templateLayout) : {
        sections: DEFAULT_TEMPLATE.defaultLayout,
        showHeader: true,
        showLogo: true,
        showWatermark: false
      };
    } catch (e) {
      return {
        sections: DEFAULT_TEMPLATE.defaultLayout,
        showHeader: true,
        showLogo: true,
        showWatermark: false
      };
    }
  });
  
  // Set specialist name in form data
  useEffect(() => {
    if (selectedSpecialist && users) {
      const specialist = users.find(u => u.id === selectedSpecialist);
      if (specialist) {
        onInputChange('specialistName', specialist.name || '');
      }
    }
  }, [selectedSpecialist, users, onInputChange]);
  
  // Handle template change
  const handleTemplateChange = (template: PDFTemplate) => {
    setSelectedTemplate(template);
    
    // Update colors and layout
    setColors({
      primary: template.primaryColor,
      secondary: template.secondaryColor,
      accent: template.accentColor,
      background: template.backgroundColor
    });
    
    setLayout({
      ...layout,
      sections: [...template.defaultLayout]
    });
    
    // Update form data
    onInputChange('templateId', template.id);
    onInputChange('templateColors', JSON.stringify({
      primary: template.primaryColor,
      secondary: template.secondaryColor,
      accent: template.accentColor,
      background: template.backgroundColor
    }));
  };
  
  // Handle color change
  const handleColorChange = (name: keyof TemplateColors, value: string) => {
    const updatedColors = { ...colors, [name]: value };
    setColors(updatedColors);
    onInputChange('templateColors', JSON.stringify(updatedColors));
  };
  
  // Handle sections change
  const handleSectionsChange = (sections: string[]) => {
    const updatedLayout = { ...layout, sections };
    setLayout(updatedLayout);
    onInputChange('templateLayout', JSON.stringify(updatedLayout));
  };
  
  // Handle layout option change
  const handleLayoutOptionChange = (name: keyof Omit<TemplateLayout, 'sections'>, value: boolean) => {
    const updatedLayout = { ...layout, [name]: value };
    setLayout(updatedLayout);
    onInputChange('templateLayout', JSON.stringify(updatedLayout));
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-6">
      <div className="col-span-1 lg:col-span-2">
        <ScrollArea className="h-[calc(100vh-16rem)] pr-4">
          <Card>
            <CardContent className="p-6">
              <EditorTabs 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                colors={colors}
                layout={layout}
                selectedTemplate={selectedTemplate}
                formData={formData}
                onInputChange={onInputChange}
                users={users || []}
                isAdmin={user?.role === 'admin'}
                selectedSpecialist={selectedSpecialist}
                setSelectedSpecialist={setSelectedSpecialist}
                handleTemplateChange={handleTemplateChange}
                handleColorChange={handleColorChange}
                handleSectionsChange={handleSectionsChange}
                handleLayoutOptionChange={handleLayoutOptionChange}
              />
            </CardContent>
          </Card>
        </ScrollArea>
      </div>
      
      <div className="col-span-1 mt-6 lg:mt-0">
        <ProposalPreviewContainer 
          formData={formData} 
          selectedTemplate={selectedTemplate} 
          imagePreview={imagePreview}
          companyData={companyData}
          onGeneratePDF={onGenerateProposal} 
        />
      </div>
    </div>
  );
};

export default PDFEditorTabContent;
