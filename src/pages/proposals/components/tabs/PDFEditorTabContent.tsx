
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Layout, Image, Move, Check, Eye } from "lucide-react";
import { ExtractedData, PDFTemplate } from "@/lib/types/proposals";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import PDFTemplatePreview from '@/components/proposals/pdf-editor/PDFTemplatePreview';
import TemplateSelector from '@/components/proposals/pdf-editor/TemplateSelector';
import ColorSelector from '@/components/proposals/pdf-editor/ColorSelector';
import SectionOrganizer from '@/components/proposals/pdf-editor/SectionOrganizer';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/contexts/auth';
import { useUsers } from '@/hooks/useUsers';
import { SelectSpecialist } from '@/components/proposals/pdf-editor/SelectSpecialist';

interface PDFEditorTabContentProps {
  formData: Partial<ExtractedData>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerateProposal: () => void;
  imagePreview: string | null;
}

const PDFEditorTabContent = ({
  formData,
  onInputChange,
  onGenerateProposal,
  imagePreview
}: PDFEditorTabContentProps) => {
  const { user } = useAuth();
  const { users } = useUsers();
  const [editorTab, setEditorTab] = useState('template');
  const [previewMode, setPreviewMode] = useState(false);
  
  // Default template options
  const templates: PDFTemplate[] = [
    {
      id: 'default',
      name: 'Padrão',
      description: 'Template padrão para propostas',
      preview: '/lovable-uploads/ec1cbd63-b95a-4f6d-9ad9-1b03e468f446.png',
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      accentColor: '#10B981',
      backgroundColor: '#F8FAFC',
      defaultLayout: ['client', 'debt', 'payment', 'fees']
    },
    {
      id: 'corporate',
      name: 'Corporativo',
      description: 'Template com visual mais formal e profissional',
      preview: '/lovable-uploads/d939ccfc-a061-45e8-97e0-1fa1b82d3df2.png',
      primaryColor: '#1E40AF',
      secondaryColor: '#1E3A8A',
      accentColor: '#047857',
      backgroundColor: '#F9FAFB',
      defaultLayout: ['client', 'debt', 'fees', 'payment']
    },
    {
      id: 'modern',
      name: 'Moderno',
      description: 'Template com visual moderno e dinâmico',
      preview: '/lovable-uploads/d939ccfc-a061-45e8-97e0-1fa1b82d3df2.png',
      primaryColor: '#6D28D9',
      secondaryColor: '#4C1D95',
      accentColor: '#059669',
      backgroundColor: '#F5F3FF',
      defaultLayout: ['debt', 'client', 'payment', 'fees']
    }
  ];

  // Handle specialist change
  const handleSpecialistChange = (specialistName: string) => {
    const event = {
      target: {
        name: 'specialistName',
        value: specialistName
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onInputChange(event);
  };

  // Handle template selection
  const handleTemplateSelect = (template: PDFTemplate) => {
    // Update template ID
    const templateEvent = {
      target: {
        name: 'templateId',
        value: template.id
      }
    } as React.ChangeEvent<HTMLInputElement>;
    onInputChange(templateEvent);
    
    // Update template colors
    const colorsEvent = {
      target: {
        name: 'templateColors',
        value: JSON.stringify({
          primary: template.primaryColor,
          secondary: template.secondaryColor,
          accent: template.accentColor,
          background: template.backgroundColor
        })
      }
    } as React.ChangeEvent<HTMLInputElement>;
    onInputChange(colorsEvent);
    
    // Update template layout
    const layoutEvent = {
      target: {
        name: 'templateLayout',
        value: JSON.stringify({
          sections: template.defaultLayout,
          showHeader: true,
          showLogo: true,
          showWatermark: false
        })
      }
    } as React.ChangeEvent<HTMLInputElement>;
    onInputChange(layoutEvent);
  };

  // Get selected template
  const selectedTemplate = templates.find(t => t.id === formData.templateId) || templates[0];
  
  // Check if user is admin to enable specialist selection
  const isAdmin = user?.role === 'admin';

  return (
    <div className={`${previewMode ? 'grid grid-cols-1' : 'grid grid-cols-1 lg:grid-cols-5 gap-6'}`}>
      {/* Preview Mode Toggle */}
      <div className="lg:col-span-5 mb-4 flex justify-end">
        <Button 
          variant={previewMode ? "default" : "outline"} 
          onClick={() => setPreviewMode(!previewMode)}
          className="flex items-center"
        >
          <Eye className="mr-2 h-4 w-4" />
          {previewMode ? "Voltar ao Editor" : "Modo de Visualização"}
        </Button>
      </div>
      
      {previewMode ? (
        // Full screen preview mode
        <div className="space-y-4">
          <Card className="shadow-md">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium">Prévia Final da Proposta</CardTitle>
                <Button 
                  onClick={onGenerateProposal} 
                  className="bg-af-blue-600 hover:bg-af-blue-700"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Gerar Proposta
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <PDFTemplatePreview
                formData={formData}
                template={selectedTemplate}
                imagePreview={imagePreview}
              />
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          {/* Left side: Editor controls */}
          <Card className="lg:col-span-2 shadow-md overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
              <CardTitle className="text-lg font-medium">Personalizar Proposta</CardTitle>
            </CardHeader>
            
            <CardContent className="p-0">
              <Tabs value={editorTab} onValueChange={setEditorTab} className="w-full">
                <TabsList className="w-full justify-start p-0 bg-transparent border-b rounded-none">
                  <TabsTrigger value="template" className="data-[state=active]:bg-slate-100 rounded-none border-b-2 border-transparent data-[state=active]:border-af-blue-600">
                    <Layout className="h-4 w-4 mr-2" />
                    Template
                  </TabsTrigger>
                  <TabsTrigger value="colors" className="data-[state=active]:bg-slate-100 rounded-none border-b-2 border-transparent data-[state=active]:border-af-blue-600">
                    <Palette className="h-4 w-4 mr-2" />
                    Cores
                  </TabsTrigger>
                  <TabsTrigger value="sections" className="data-[state=active]:bg-slate-100 rounded-none border-b-2 border-transparent data-[state=active]:border-af-blue-600">
                    <Move className="h-4 w-4 mr-2" />
                    Seções
                  </TabsTrigger>
                  <TabsTrigger value="specialist" className="data-[state=active]:bg-slate-100 rounded-none border-b-2 border-transparent data-[state=active]:border-af-blue-600">
                    <Image className="h-4 w-4 mr-2" />
                    Especialista
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="template" className="p-4 space-y-4">
                  <TemplateSelector 
                    templates={templates}
                    selectedTemplateId={formData.templateId || 'default'}
                    onSelectTemplate={handleTemplateSelect}
                  />
                </TabsContent>
                
                <TabsContent value="colors" className="p-4 space-y-4">
                  <ColorSelector 
                    formData={formData}
                    onInputChange={onInputChange}
                    selectedTemplate={selectedTemplate}
                  />
                </TabsContent>
                
                <TabsContent value="sections" className="p-4 space-y-4">
                  <SectionOrganizer
                    formData={formData}
                    onInputChange={onInputChange}
                    defaultSections={selectedTemplate.defaultLayout}
                  />
                </TabsContent>
                
                <TabsContent value="specialist" className="p-4 space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Especialista Tributário</h3>
                      <p className="text-xs text-slate-500">
                        Este nome aparecerá como o responsável pela proposta no documento final.
                      </p>
                    </div>
                    
                    {isAdmin ? (
                      <SelectSpecialist
                        users={users}
                        selectedSpecialist={formData.specialistName || user?.name || ''}
                        onChange={handleSpecialistChange}
                        isAdmin={isAdmin}
                      />
                    ) : (
                      <div className="bg-slate-50 p-3 rounded border">
                        <Label className="text-xs text-slate-500">Especialista</Label>
                        <Input 
                          value={user?.name || ''}
                          disabled
                          className="mt-1 bg-white"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Apenas administradores podem alterar o especialista.
                        </p>
                      </div>
                    )}
                    
                    <div className="bg-slate-50 p-3 rounded border mt-4">
                      <RadioGroup 
                        defaultValue="signature" 
                        value={formData.showSignature === "false" ? "no-signature" : "signature"}
                        onValueChange={(value) => {
                          const event = {
                            target: {
                              name: 'showSignature',
                              value: value === "signature" ? "true" : "false"
                            }
                          } as React.ChangeEvent<HTMLInputElement>;
                          onInputChange(event);
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="signature" id="signature" />
                          <Label htmlFor="signature">Mostrar assinatura</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no-signature" id="no-signature" />
                          <Label htmlFor="no-signature">Ocultar assinatura</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            
            <CardFooter className="flex justify-between border-t pt-4">
              <Button
                variant="outline"
                onClick={() => setEditorTab(editorTab === 'template' ? 'specialist' : 
                      editorTab === 'specialist' ? 'sections' : 
                      editorTab === 'sections' ? 'colors' : 'template')}
              >
                Voltar
              </Button>
              
              <Button
                onClick={onGenerateProposal}
                className="bg-af-blue-600 hover:bg-af-blue-700"
              >
                <Check className="mr-2 h-4 w-4" />
                Gerar Proposta
              </Button>
            </CardFooter>
          </Card>
          
          {/* Right side: PDF preview */}
          <div className="lg:col-span-3">
            <Card className="shadow-md h-full">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium">Prévia da Proposta</CardTitle>
                  <Badge variant="outline">Visualização</Badge>
                </div>
              </CardHeader>
              
              <CardContent className="p-4 overflow-auto" style={{ maxHeight: '70vh' }}>
                <PDFTemplatePreview
                  formData={formData}
                  template={selectedTemplate}
                  imagePreview={imagePreview}
                />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default PDFEditorTabContent;
