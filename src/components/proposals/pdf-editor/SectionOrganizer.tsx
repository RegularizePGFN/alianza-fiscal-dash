
import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CheckSquare, GripVertical } from "lucide-react";
import { TemplateLayout } from "@/lib/types/proposals";

type SectionName = 'client' | 'debt' | 'payment' | 'alert' | 'fees' | 'total';

const sectionLabels: Record<SectionName, string> = {
  client: 'Informações do Cliente',
  debt: 'Dados da Dívida',
  payment: 'Opções de Pagamento',
  alert: 'Alerta de Consequências',
  fees: 'Honorários',
  total: 'Valor Total'
};

interface SectionOrganizerProps {
  sections: string[];
  onChange: (sections: string[]) => void;
  layoutOptions: {
    showHeader: boolean;
    showLogo: boolean;
    showWatermark: boolean;
  };
  onLayoutOptionChange: (name: keyof Omit<TemplateLayout, "sections">, value: boolean) => void;
}

const SectionOrganizer = ({ 
  sections, 
  onChange, 
  layoutOptions, 
  onLayoutOptionChange 
}: SectionOrganizerProps) => {

  // Handle drag end and reorder sections
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    onChange(items);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <CheckSquare className="h-4 w-4 mr-2 text-gray-500" />
          Organizar Seções
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <p className="text-xs text-gray-500">
            Arraste as seções para reorganizar a ordem em que aparecem na proposta.
          </p>
          
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="sections">
              {(provided) => (
                <div
                  className="space-y-2"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {sections.map((section, index) => (
                    <Draggable key={section} draggableId={section} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="flex items-center p-2 bg-slate-100 rounded-md"
                        >
                          <GripVertical className="h-4 w-4 mr-2 text-slate-500" />
                          <span className="text-sm">
                            {sectionLabels[section as SectionName] || section}
                          </span>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
        
        <div className="space-y-4 pt-2 border-t">
          <h4 className="text-sm font-medium">Opções de Layout</h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="show-header" className="cursor-pointer">
                Mostrar Cabeçalho
              </Label>
              <Switch 
                id="show-header" 
                checked={layoutOptions.showHeader}
                onCheckedChange={(checked) => onLayoutOptionChange('showHeader', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="show-logo" className="cursor-pointer">
                Mostrar Logo
              </Label>
              <Switch 
                id="show-logo" 
                checked={layoutOptions.showLogo}
                onCheckedChange={(checked) => onLayoutOptionChange('showLogo', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="show-watermark" className="cursor-pointer">
                Mostrar Marca d'água
              </Label>
              <Switch 
                id="show-watermark" 
                checked={layoutOptions.showWatermark}
                onCheckedChange={(checked) => onLayoutOptionChange('showWatermark', checked)}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SectionOrganizer;
