import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Repeat, Clock } from "lucide-react";

interface AgendamentosTypeSelectorProps {
  activeType: 'conventional' | 'recurring';
  onTypeChange: (type: 'conventional' | 'recurring') => void;
}

export const AgendamentosTypeSelector = ({ 
  activeType, 
  onTypeChange 
}: AgendamentosTypeSelectorProps) => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-center gap-8">
        <Button
          variant={activeType === 'conventional' ? 'default' : 'outline'}
          onClick={() => onTypeChange('conventional')}
          className="flex items-center gap-2 h-12 px-8"
        >
          <Clock className="h-5 w-5" />
          Agendamento Convencional
        </Button>
        
        <Button
          variant={activeType === 'recurring' ? 'default' : 'outline'}
          onClick={() => onTypeChange('recurring')}
          className="flex items-center gap-2 h-12 px-8"
        >
          <Repeat className="h-5 w-5" />
          Agendamento Recorrente
        </Button>
      </div>
    </Card>
  );
};