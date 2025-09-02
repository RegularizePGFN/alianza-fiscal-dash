import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ConversationMessage {
  id: string;
  text: string;
  type: 'sent' | 'received';
  timestamp: string;
}

interface ConversationHistoryProps {
  contactPhone: string;
  instanceName: string;
}

export const ConversationHistory = ({ contactPhone, instanceName }: ConversationHistoryProps) => {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [hasMessages, setHasMessages] = useState(false);
  const { toast } = useToast();

  const fetchConversationHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-conversation-history', {
        body: {
          contact_phone: contactPhone,
          instance_name: instanceName
        }
      });

      console.log('Function response:', { data, error });

      if (error) {
        console.error('Function error details:', error);
        throw new Error(error.message || 'Erro na função');
      }

      if (data?.success && data?.messages) {
        setMessages(data.messages);
        setHasMessages(data.messages.length > 0);
        
        if (data.messages.length > 0) {
          setExpanded(true);
          toast({
            title: "Histórico atualizado",
            description: `Encontradas ${data.messages.length} mensagens recentes.`,
          });
        } else {
          toast({
            title: "Nenhuma mensagem encontrada",
            description: "Não há histórico de conversas para este contato.",
          });
        }
      } else {
        console.error('Unexpected response format:', data);
        throw new Error(data?.error || 'Formato de resposta inesperado');
      }
    } catch (error: any) {
      console.error('Error fetching conversation history:', error);
      
      // Melhor tratamento de erro
      let errorMessage = "Não foi possível buscar o histórico de conversas.";
      if (error.message?.includes('Instance not found')) {
        errorMessage = "Instância não encontrada ou não configurada.";
      } else if (error.message?.includes('Evolution API')) {
        errorMessage = "Erro na API do WhatsApp. Verifique a configuração da instância.";
      }
      
      toast({
        title: "Erro ao buscar histórico",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = () => {
    if (!hasMessages) {
      fetchConversationHistory();
    } else {
      setExpanded(!expanded);
    }
  };

  return (
    <div className="border-t border-border pt-3 mt-3">
      <div className="flex items-center gap-2 mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchConversationHistory}
          disabled={loading}
          className="gap-2 h-8"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Buscando...' : 'Atualizar Histórico'}
        </Button>
        
        {hasMessages && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleExpanded}
            className="gap-1 h-8"
          >
            <MessageCircle className="h-3 w-3" />
            {messages.length} mensagens
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        )}
      </div>

      {expanded && hasMessages && (
        <Card className="bg-muted/30">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Últimas {messages.length} mensagens
              </span>
            </div>
            
            <div className="space-y-2">
              {messages.map((message, index) => (
                <div
                  key={`${message.id}-${index}`}
                  className={`flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-lg p-2 ${
                    message.type === 'sent' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-background border'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        variant={message.type === 'sent' ? 'secondary' : 'outline'}
                        className="text-xs"
                      >
                        {message.type === 'sent' ? 'Enviada' : 'Recebida'}
                      </Badge>
                      <span className="text-xs opacity-70">
                        {format(new Date(message.timestamp), "dd/MM 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};