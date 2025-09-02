import { Button } from "@/components/ui/button";
import { Calendar, Settings, Send, List, CalendarDays } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface AgendamentosHeaderProps {
  onCreateAgendamento: () => void;
  onManageInstances: () => void;
  showManageInstances: boolean;
  onRefresh?: () => void;
  viewMode: 'list' | 'calendar';
  onViewModeChange: (mode: 'list' | 'calendar') => void;
}

export const AgendamentosHeader = ({ 
  onCreateAgendamento, 
  onManageInstances, 
  showManageInstances,
  onRefresh,
  viewMode,
  onViewModeChange
}: AgendamentosHeaderProps) => {
  const { toast } = useToast();

  const handleProcessMessages = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await fetch('https://sbxltdbnqixucjoognfj.supabase.co/functions/v1/send-scheduled-messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to process messages');
      }

      toast({
        title: "Processando mensagens",
        description: "As mensagens pendentes estão sendo processadas.",
      });
      
      onRefresh?.();
    } catch (error: any) {
      console.error('Error processing messages:', error);
      toast({
        title: "Erro ao processar mensagens",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Agendamentos</h1>
        <p className="text-muted-foreground">
          Programe mensagens do WhatsApp para seus clientes
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        {/* View Mode Toggle */}
        <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && onViewModeChange(value as 'list' | 'calendar')}>
          <ToggleGroupItem value="list" aria-label="Lista" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Lista
          </ToggleGroupItem>
          <ToggleGroupItem value="calendar" aria-label="Agenda" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Agenda
          </ToggleGroupItem>
        </ToggleGroup>
        <Button
          variant="outline"
          onClick={handleProcessMessages}
          className="flex items-center gap-2"
        >
          <Send className="h-4 w-4" />
          Processar Pendentes
        </Button>
        
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