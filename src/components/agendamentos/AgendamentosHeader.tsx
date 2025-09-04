import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Settings, Calendar, List, MessageCircle, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useState } from "react";
import { PredefinedMessagesModal } from "./PredefinedMessagesModal";

interface AgendamentosHeaderProps {
  onCreateAgendamento: () => void;
  onManageInstances: () => void;
  showManageInstances: boolean;
  onRefresh?: () => void;
  viewMode: 'list' | 'calendar';
  onViewModeChange: (mode: 'list' | 'calendar') => void;
  isRecurring?: boolean;
}

export const AgendamentosHeader = ({ 
  onCreateAgendamento, 
  onManageInstances, 
  showManageInstances, 
  onRefresh,
  viewMode,
  onViewModeChange,
  isRecurring = false
}: AgendamentosHeaderProps) => {
  const { toast } = useToast();
  const [showPredefinedMessages, setShowPredefinedMessages] = useState(false);

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
    <>
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-blue-200/50 dark:border-blue-700/50 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40">
              <MessageCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Agendamentos</h1>
              <p className="text-muted-foreground">
                Programe mensagens do WhatsApp para seus clientes
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {/* View Mode Toggle */}
            <div className="flex rounded-lg bg-white dark:bg-gray-800 p-1 border border-blue-200 dark:border-blue-700 shadow-sm">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('list')}
                className={`flex items-center gap-2 transition-all duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300' 
                    : 'hover:bg-blue-50 dark:hover:bg-blue-900/20'
                }`}
              >
                <div className="p-1 rounded bg-blue-100 dark:bg-blue-900/30">
                  <List className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                </div>
                Lista
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('calendar')}
                className={`flex items-center gap-2 transition-all duration-200 ${
                  viewMode === 'calendar' 
                    ? 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300' 
                    : 'hover:bg-purple-50 dark:hover:bg-purple-900/20'
                }`}
              >
                <div className="p-1 rounded bg-purple-100 dark:bg-purple-900/30">
                  <Calendar className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                </div>
                Agenda
              </Button>
            </div>
            
            {/* Action Buttons */}
            <Button
              variant="outline"
              onClick={() => setShowPredefinedMessages(true)}
              className="flex items-center gap-2 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 dark:hover:bg-purple-900/30 transition-all duration-200"
            >
              <div className="p-1 rounded bg-purple-100 dark:bg-purple-900/30">
                <FileText className="h-3 w-3 text-purple-600 dark:text-purple-400" />
              </div>
              Mensagens Pré-Definidas
            </Button>
            
            <Button
              variant="outline"
              onClick={handleProcessMessages}
              className="flex items-center gap-2 hover:bg-green-50 hover:border-green-300 hover:text-green-700 dark:hover:bg-green-900/30 transition-all duration-200"
            >
              <div className="p-1 rounded bg-green-100 dark:bg-green-900/30">
                <RefreshCw className="h-3 w-3 text-green-600 dark:text-green-400" />
              </div>
              Processar Pendentes
            </Button>
            
            {showManageInstances && (
              <Button
                variant="outline"
                onClick={onManageInstances}
                className="flex items-center gap-2 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 dark:hover:bg-orange-900/30 transition-all duration-200"
              >
                <div className="p-1 rounded bg-orange-100 dark:bg-orange-900/30">
                  <Settings className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                </div>
                Gerenciar Instâncias
              </Button>
            )}
            
            <Button
              onClick={onCreateAgendamento}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <div className="p-1 rounded bg-white/20">
                <Plus className="h-3 w-3" />
              </div>
              {isRecurring ? 'Nova Mensagem Recorrente' : 'Novo Agendamento'}
            </Button>
          </div>
        </div>
      </div>

      <PredefinedMessagesModal
        open={showPredefinedMessages}
        onOpenChange={setShowPredefinedMessages}
      />
    </>
  );
};