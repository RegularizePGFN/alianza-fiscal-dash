import { Button } from "@/components/ui/button";
import { Calendar, Settings } from "lucide-react";

interface AgendamentosHeaderProps {
  onCreateAgendamento: () => void;
  onManageInstances: () => void;
  showManageInstances: boolean;
}

export const AgendamentosHeader = ({ 
  onCreateAgendamento, 
  onManageInstances, 
  showManageInstances 
}: AgendamentosHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Agendamentos</h1>
        <p className="text-muted-foreground">
          Programe mensagens do WhatsApp para seus clientes
        </p>
      </div>
      
      <div className="flex gap-3">
        {showManageInstances && (
          <Button
            variant="outline"
            onClick={onManageInstances}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Gerenciar Instâncias
          </Button>
        )}
        
        <Button
          onClick={onCreateAgendamento}
          className="flex items-center gap-2"
        >
          <Calendar className="h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>
    </div>
  );
};