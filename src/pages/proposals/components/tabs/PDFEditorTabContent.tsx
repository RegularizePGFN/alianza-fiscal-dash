
import { useState, useEffect, useRef } from "react";
import { PDFTemplate, ExtractedData, TemplateColors, TemplateLayout } from "@/lib/types/proposals";
import { useToast } from "@/hooks/use-toast";
import { generateProposalPdf } from "@/lib/pdfUtils";
import { User } from "@/lib/types";
import { FileText } from "lucide-react";
import { EditorTabs } from "@/components/proposals/pdf-editor/EditorTabs";
import { ProposalPreviewContainer } from "@/components/proposals/pdf-editor/ProposalPreviewContainer";

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

interface PDFEditorTabContentProps {
  formData: Partial<ExtractedData>;
  onInputChange: (name: string, value: string) => void;
  imagePreview: string | null;
  users?: User[];
  isAdmin?: boolean;
  onGenerateProposal?: () => void; 
}

export default function PDFEditorTabContent({ 
  formData, 
  onInputChange,
  imagePreview,
  users = [],
  isAdmin = false,
  onGenerateProposal
}: PDFEditorTabContentProps) {
  const [activeTab, setActiveTab] = useState("preview");
  const [selectedTemplate, setSelectedTemplate] = useState<PDFTemplate>(defaultTemplates[0]);
  const [selectedSpecialist, setSelectedSpecialist] = useState(formData.specialistName || "");
  const { toast } = useToast();
  const previewRef = useRef<HTMLDivElement | null>(null);

  // Parse colors from formData or use defaults
  const [colors, setColors] = useState<TemplateColors>(() => {
    if (formData.templateColors && typeof formData.templateColors === 'string') {
      try {
        return JSON.parse(formData.templateColors);
      } catch (e) {
        console.error('Failed to parse template colors', e);
      }
    }
    return {
      primary: selectedTemplate.primaryColor,
      secondary: selectedTemplate.secondaryColor,
      accent: selectedTemplate.accentColor,
      background: selectedTemplate.backgroundColor
    };
  });

  // Parse layout from formData or use defaults
  const [layout, setLayout] = useState<TemplateLayout>(() => {
    if (formData.templateLayout && typeof formData.templateLayout === 'string') {
      try {
        return JSON.parse(formData.templateLayout);
      } catch (e) {
        console.error('Failed to parse template layout', e);
      }
    }
    return {
      sections: selectedTemplate.defaultLayout,
      showHeader: true,
      showLogo: true,
      showWatermark: false
    };
  });

  // Update formData when template changes
  useEffect(() => {
    if (formData.templateId) {
      const template = defaultTemplates.find(t => t.id === formData.templateId);
      if (template) {
        setSelectedTemplate(template);
      }
    }
  }, [formData.templateId]);

  // Update colors in formData when they change
  useEffect(() => {
    onInputChange("templateColors", JSON.stringify(colors));
  }, [colors, onInputChange]);

  // Update layout in formData when it changes
  useEffect(() => {
    onInputChange("templateLayout", JSON.stringify(layout));
  }, [layout, onInputChange]);

  // Always set showSignature to true since we're removing the toggle
  useEffect(() => {
    onInputChange("showSignature", "true");
  }, [onInputChange]);

  // Update specialist name in formData when it changes
  useEffect(() => {
    onInputChange("specialistName", selectedSpecialist);
  }, [selectedSpecialist, onInputChange]);
  
  // Handle template change
  const handleTemplateChange = (template: PDFTemplate) => {
    setSelectedTemplate(template);
    onInputChange("templateId", template.id);
    
    // Update colors
    const newColors = {
      primary: template.primaryColor,
      secondary: template.secondaryColor,
      accent: template.accentColor,
      background: template.backgroundColor
    };
    setColors(newColors);
    onInputChange("templateColors", JSON.stringify(newColors));
    
    // Update layout
    const newLayout = {
      ...layout,
      sections: template.defaultLayout,
    };
    setLayout(newLayout);
    onInputChange("templateLayout", JSON.stringify(newLayout));
  };

  // Handle color changes
  const handleColorChange = (name: keyof TemplateColors, value: string) => {
    setColors(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle layout changes
  const handleSectionsChange = (sections: string[]) => {
    setLayout(prev => ({
      ...prev,
      sections
    }));
  };

  // Handle layout options
  const handleLayoutOptionChange = (name: keyof Omit<TemplateLayout, "sections">, value: boolean) => {
    setLayout(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Generate PDF
  const handleGeneratePDF = async () => {
    // If onGenerateProposal is provided, call it instead of generating PDF directly
    if (onGenerateProposal) {
      onGenerateProposal();
      return;
    }
    
    // Obter o elemento de pré-visualização
    const previewElement = previewRef.current?.querySelector(".preview-proposal");
    if (!previewElement) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Processando",
      description: "Gerando PDF otimizado em uma única página, aguarde...",
    });
    
    try {
      await generateProposalPdf(previewElement as HTMLElement, formData);
      
      toast({
        title: "Sucesso",
        description: "PDF gerado com sucesso em uma única página!",
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
            <h2 className="font-semibold flex items-center mb-4">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Editor de Proposta
            </h2>
            
            <EditorTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              colors={colors}
              layout={layout}
              selectedTemplate={selectedTemplate}
              formData={formData}
              onInputChange={onInputChange}
              users={users}
              isAdmin={isAdmin}
              selectedSpecialist={selectedSpecialist}
              setSelectedSpecialist={setSelectedSpecialist}
              handleTemplateChange={handleTemplateChange}
              handleColorChange={handleColorChange}
              handleSectionsChange={handleSectionsChange}
              handleLayoutOptionChange={handleLayoutOptionChange}
            />
          </div>
        </div>

        <ProposalPreviewContainer
          formData={formData}
          selectedTemplate={selectedTemplate}
          imagePreview={imagePreview}
          onGeneratePDF={handleGeneratePDF}
        />
      </div>
    </div>
  );
}
