
import React from 'react';
import { Card } from '@/components/ui/card';
import { PDFTemplate } from '@/lib/types/proposals';
import { Check } from 'lucide-react';

interface TemplateSelectorProps {
  templates: PDFTemplate[];
  selectedTemplateId: string;
  onSelectTemplate: (template: PDFTemplate) => void;
}

const TemplateSelector = ({ 
  templates, 
  selectedTemplateId, 
  onSelectTemplate 
}: TemplateSelectorProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium">Escolha um Template</h3>
        <p className="text-xs text-slate-500">
          Selecione o design base para sua proposta
        </p>
      </div>
      
      <div className="grid gap-4">
        {templates.map((template) => (
          <Card 
            key={template.id}
            className={`relative border cursor-pointer transition-all overflow-hidden hover:border-af-blue-400 ${
              template.id === selectedTemplateId ? 'ring-2 ring-af-blue-500' : ''
            }`}
            onClick={() => onSelectTemplate(template)}
          >
            {template.id === selectedTemplateId && (
              <div className="absolute top-2 right-2 bg-af-blue-500 text-white p-1 rounded-full">
                <Check className="h-4 w-4" />
              </div>
            )}
            
            <div className="p-3">
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                  <img 
                    src={template.preview} 
                    alt={template.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-medium">{template.name}</h4>
                  <p className="text-xs text-slate-500">{template.description}</p>
                  
                  <div className="flex items-center gap-1 mt-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: template.primaryColor }}
                    ></div>
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: template.secondaryColor }}
                    ></div>
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: template.accentColor }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;
