
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, FileText, Palette, CheckSquare } from "lucide-react";
import { PDFTemplate } from "@/lib/types/proposals";
import { PreviewTabContent } from "./tabs/PreviewTabContent";
import { TemplateTabContent } from "./tabs/TemplateTabContent";
import { ColorTabContent } from "./tabs/ColorTabContent";
import { StructureTabContent } from "./tabs/StructureTabContent";
import { TemplateColors, TemplateLayout } from "@/lib/types/proposals";

interface EditorTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  colors: TemplateColors;
  layout: TemplateLayout;
  selectedTemplate: PDFTemplate;
  formData: any;
  onInputChange: (name: string, value: string) => void;
  users: any[];
  isAdmin: boolean;
  selectedSpecialist: string;
  setSelectedSpecialist: (specialist: string) => void;
  handleTemplateChange: (template: PDFTemplate) => void;
  handleColorChange: (name: keyof TemplateColors, value: string) => void;
  handleSectionsChange: (sections: string[]) => void;
  handleLayoutOptionChange: (name: keyof Omit<TemplateLayout, "sections">, value: boolean) => void;
}

export const EditorTabs = ({
  activeTab,
  setActiveTab,
  colors,
  layout,
  selectedTemplate,
  formData,
  onInputChange,
  users,
  isAdmin,
  selectedSpecialist,
  setSelectedSpecialist,
  handleTemplateChange,
  handleColorChange,
  handleSectionsChange,
  handleLayoutOptionChange
}: EditorTabsProps) => {
  return (
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
        <PreviewTabContent 
          users={users}
          selectedSpecialist={selectedSpecialist}
          onChange={setSelectedSpecialist}
          isAdmin={isAdmin}
          formData={formData}
          onInputChange={onInputChange}
        />
      </TabsContent>
      
      <TabsContent value="template">
        <TemplateTabContent 
          selectedTemplateId={selectedTemplate.id}
          onSelectTemplate={handleTemplateChange}
        />
      </TabsContent>
      
      <TabsContent value="colors">
        <ColorTabContent 
          colors={colors} 
          onChange={handleColorChange} 
        />
      </TabsContent>
      
      <TabsContent value="structure">
        <StructureTabContent 
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
  );
};
