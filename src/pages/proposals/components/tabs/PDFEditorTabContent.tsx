import { useState, useEffect } from "react";
import {
  PDFTemplatePreview,
  ColorSelector,
  SectionOrganizer,
  SelectSpecialist,
  TemplateSelector,
  AdditionalCommentsField
} from "@/components/proposals/pdf-editor";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Download, Eye, FileText, Palette, CheckSquare } from "lucide-react";
import { generateProposalPdf } from "@/lib/pdfUtils";
import { User } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { ExtractedData, PDFTemplate, TemplateColors, TemplateLayout } from "@/lib/types/proposals";

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
  users: User[];
  isAdmin?: boolean;
}

export default function PDFEditorTabContent({ 
  formData, 
  onInputChange,
  imagePreview,
  users = [],
  isAdmin = false
}: PDFEditorTabContentProps) {
  const [activeTab, setActiveTab] = useState("preview");
  const [selectedTemplate, setSelectedTemplate] = useState<PDFTemplate>(defaultTemplates[0]);
  const [showSignature, setShowSignature] = useState(formData.showSignature === "true");
  const [selectedSpecialist, setSelectedSpecialist] = useState(formData.specialistName || "");
  const { toast } = useToast();

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
    // Find template based on formData.templateId
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

  // Update showSignature in formData when it changes
  useEffect(() => {
    onInputChange("showSignature", showSignature ? "true" : "false");
  }, [showSignature, onInputChange]);

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
    const previewElement = document.querySelector(".preview-proposal");
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
      description: "Gerando PDF, aguarde um momento...",
    });
    
    try {
      await generateProposalPdf(previewElement as HTMLElement, formData);
      
      toast({
        title: "Sucesso",
        description: "PDF gerado com sucesso!",
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
          <h2 className="font-semibold flex items-center mb-4">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            Editor de Proposta
          </h2>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full mb-4">
              <TabsTrigger value="preview" className="flex-1">
                <Eye className="h-4 w-4 mr-2" />
                Visualizar
              </TabsTrigger>
              <TabsTrigger value="template" className="flex-1">
                <FileText className="h-4 w-4 mr-2" />
                Modelos
              </TabsTrigger>
              <TabsTrigger value="colors" className="flex-1">
                <Palette className="h-4 w-4 mr-2" />
                Cores
              </TabsTrigger>
              <TabsTrigger value="structure" className="flex-1">
                <CheckSquare className="h-4 w-4 mr-2" />
                Estrutura
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="preview">
              <div className="space-y-4">
                <SelectSpecialist 
                  users={users}
                  selectedSpecialist={selectedSpecialist}
                  onChange={setSelectedSpecialist}
                  isAdmin={isAdmin}
                />
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-signature" className="cursor-pointer">
                      Mostrar Assinatura
                    </Label>
                    <Switch 
                      id="show-signature" 
                      checked={showSignature}
                      onCheckedChange={setShowSignature}
                    />
                  </div>
                </div>
                
                <AdditionalCommentsField
                  value={formData.additionalComments || ''}
                  onChange={(value) => onInputChange('additionalComments', value)}
                />
                
                <Button 
                  onClick={handleGeneratePDF}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar PDF
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="template">
              <TemplateSelector 
                templates={defaultTemplates}
                selectedTemplateId={selectedTemplate.id}
                onSelectTemplate={handleTemplateChange}
              />
            </TabsContent>
            
            <TabsContent value="colors">
              <ColorSelector colors={colors} onChange={handleColorChange} />
            </TabsContent>
            
            <TabsContent value="structure">
              <SectionOrganizer 
                sections={layout.sections}
                onChange={handleSectionsChange}
                layoutOptions={{
                  showHeader: layout.showHeader,
                  showLogo: layout.showLogo,
                  showWatermark: layout.showWatermark
                }}
                onLayoutOptionChange={handleLayoutOptionChange}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div>
        <div className="sticky top-4 mb-4">
          <PDFTemplatePreview 
            formData={formData}
            template={selectedTemplate}
            imagePreview={imagePreview}
          />
        </div>
      </div>
    </div>
  );
}
