
import React from 'react';
import { Button } from "@/components/ui/button";
import { RotateCcw, Edit2 } from "lucide-react";

interface ActionButtonsProps {
  isEditing: boolean;
  onToggleEditMode: () => void;
  onReset: () => void;
}

const ActionButtons = ({ isEditing, onToggleEditMode, onReset }: ActionButtonsProps) => {
  return (
    <div className="flex justify-between mb-4">
      <Button 
        variant="outline" 
        onClick={onToggleEditMode}
        className="gap-2"
      >
        <Edit2 className="h-4 w-4" />
        {isEditing ? "Visualizar Proposta" : "Editar Dados"}
      </Button>
      
      <Button variant="outline" onClick={onReset} className="gap-2">
        <RotateCcw className="h-4 w-4" />
        Nova Proposta
      </Button>
    </div>
  );
};

export default ActionButtons;
