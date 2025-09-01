import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, Users, X } from "lucide-react";
import { UserRole } from "@/lib/types";

interface Instance {
  instance_name: string;
  user_name: string;
  user_id: string;
  message_count: number;
}

interface InstanceFilterProps {
  selectedInstance: string | null;
  onInstanceSelect: (instanceName: string | null) => void;
  refreshTrigger: number;
}

export const InstanceFilter = ({ 
  selectedInstance, 
  onInstanceSelect, 
  refreshTrigger 
}: InstanceFilterProps) => {
  const { user } = useAuth();
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === UserRole.ADMIN;

  const fetchInstancesWithCounts = async () => {
    if (!user || !isAdmin) return;

    try {
      // Buscar todas as instâncias ativas
      const { data: instancesData, error: instancesError } = await supabase
        .from('user_whatsapp_instances')
        .select('instance_name, user_id')
        .eq('is_active', true);

      if (instancesError) throw instancesError;

      if (!instancesData || instancesData.length === 0) {
        setInstances([]);
        return;
      }

      // Buscar informações dos usuários
      const userIds = [...new Set(instancesData.map(inst => inst.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', userIds);

      // Buscar contagem de mensagens por instância
      const { data: messagesCount, error: messagesError } = await supabase
        .from('scheduled_messages')
        .select('instance_name')
        .order('instance_name');

      if (messagesError) throw messagesError;

      // Contar mensagens por instância
      const messageCounts = (messagesCount || []).reduce((acc: Record<string, number>, msg) => {
        acc[msg.instance_name] = (acc[msg.instance_name] || 0) + 1;
        return acc;
      }, {});

      // Combinar dados
      const instancesWithCounts = instancesData.map(instance => {
        const profile = profilesData?.find(p => p.id === instance.user_id);
        return {
          instance_name: instance.instance_name,
          user_name: profile?.name || 'Usuário não encontrado',
          user_id: instance.user_id,
          message_count: messageCounts[instance.instance_name] || 0,
        };
      });

      setInstances(instancesWithCounts);
    } catch (error: any) {
      console.error('Error fetching instances:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstancesWithCounts();
  }, [user, refreshTrigger]);

  if (!isAdmin) return null;

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (instances.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <MessageCircle className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              Nenhuma instância ativa encontrada
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Filtrar por Instância
            </h3>
            {selectedInstance && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onInstanceSelect(null)}
                className="text-muted-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Limpar Filtro
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {instances.map((instance) => (
              <div
                key={instance.instance_name}
                onClick={() => onInstanceSelect(
                  selectedInstance === instance.instance_name ? null : instance.instance_name
                )}
                className={`
                  p-4 border rounded-lg cursor-pointer transition-all duration-200
                  ${selectedInstance === instance.instance_name 
                    ? 'bg-primary/10 border-primary shadow-md' 
                    : 'hover:bg-muted/50 hover:shadow-sm'
                  }
                `}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm truncate">
                      {instance.instance_name}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {instance.message_count}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span className="truncate">{instance.user_name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedInstance && (
            <div className="text-sm text-muted-foreground text-center">
              Mostrando agendamentos de: <strong>{selectedInstance}</strong>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};