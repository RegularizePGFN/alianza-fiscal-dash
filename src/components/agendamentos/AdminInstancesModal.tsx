import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Edit, RefreshCw, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminInstancesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface UserInstance {
  id: string;
  user_id: string;
  instance_name: string;
  evolution_instance_id?: string;
  evolution_api_url?: string;
  evolution_api_key?: string;
  instance_token?: string;
  is_active: boolean;
  user_name?: string;
  user_email?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface AvailableInstance {
  instanceName: string;
  status: string;
  profileName?: string;
  profileStatus?: string;
  isAlreadyAdded: boolean;
}

export const AdminInstancesModal = ({ 
  open, 
  onOpenChange, 
  onSuccess 
}: AdminInstancesModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [instances, setInstances] = useState<UserInstance[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [availableInstances, setAvailableInstances] = useState<AvailableInstance[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showAvailableInstances, setShowAvailableInstances] = useState(false);
  const [editingInstance, setEditingInstance] = useState<UserInstance | null>(null);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedInstance, setSelectedInstance] = useState("");

  const fetchData = async () => {
    try {
      // Buscar instâncias
      const { data: instancesData, error: instancesError } = await supabase
        .from('user_whatsapp_instances')
        .select('*')
        .order('created_at', { ascending: false });

      if (instancesError) throw instancesError;

      // Buscar usuários
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, name, email')
        .order('name');

      if (usersError) throw usersError;

      // Fazer join manual
      const instancesWithUsers = instancesData?.map(instance => {
        const user = usersData?.find(u => u.id === instance.user_id);
        return {
          ...instance,
          user_name: user?.name,
          user_email: user?.email,
        };
      }) || [];

      setInstances(instancesWithUsers);
      setUsers(usersData || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchAvailableInstances = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('list-available-instances');
      
      if (error) throw error;
      
      setAvailableInstances(data.instances || []);
    } catch (error: any) {
      console.error('Error fetching available instances:', error);
      toast({
        title: "Erro ao carregar instâncias",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addSelectedInstance = async (instanceName: string) => {
    if (!selectedUser) {
      toast({
        title: "Erro",
        description: "Selecione um usuário primeiro.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_whatsapp_instances')
        .insert({
          user_id: selectedUser,
          instance_name: instanceName,
          evolution_instance_id: instanceName,
          evolution_api_url: "https://evoapi.neumocrm.com.br/",
          evolution_api_key: "a9e018ea0e146a0a4ecf1dd0233e7ccf",
          is_active: true,
        });

      if (error) throw error;

      toast({
        title: "Instância adicionada",
        description: `Instância ${instanceName} foi adicionada com sucesso.`,
      });

      // Atualizar listas
      await fetchData();
      await fetchAvailableInstances();
    } catch (error: any) {
      console.error('Error adding instance:', error);
      toast({
        title: "Erro ao adicionar instância",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (instance: UserInstance) => {
    setEditingInstance(instance);
    setSelectedUser(instance.user_id);
    setSelectedInstance(instance.instance_name);
    setShowForm(true);
  };

  const updateInstance = async () => {
    if (!editingInstance || !selectedUser) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_whatsapp_instances')
        .update({
          user_id: selectedUser,
        })
        .eq('id', editingInstance.id);

      if (error) throw error;

      toast({
        title: "Instância atualizada",
        description: "A instância foi atualizada com sucesso.",
      });

      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Error updating instance:', error);
      toast({
        title: "Erro ao atualizar instância",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedUser("");
    setSelectedInstance("");
    setShowForm(false);
    setShowAvailableInstances(false);
    setEditingInstance(null);
  };

  const handleAddFromAvailable = () => {
    setEditingInstance(null);
    resetForm();
    setShowAvailableInstances(true);
    fetchAvailableInstances();
  };

  const deleteInstance = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_whatsapp_instances')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Instância removida",
        description: "A instância foi removida com sucesso.",
      });
      
      fetchData();
    } catch (error: any) {
      console.error('Error deleting instance:', error);
      toast({
        title: "Erro ao remover instância",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleInstanceStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('user_whatsapp_instances')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: currentStatus ? "Instância desativada" : "Instância ativada",
        description: "Status da instância atualizado com sucesso.",
      });
      
      fetchData();
    } catch (error: any) {
      console.error('Error updating instance:', error);
      toast({
        title: "Erro ao atualizar instância",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Gerenciar Instâncias WhatsApp
            <Button
              onClick={handleAddFromAvailable}
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Buscar Instâncias
            </Button>
          </DialogTitle>
        </DialogHeader>

        {/* Interface para selecionar instâncias disponíveis */}
        {showAvailableInstances && (
          <Card className="mb-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Instâncias Disponíveis na Evolution API</CardTitle>
                <Button
                  onClick={fetchAvailableInstances}
                  size="sm"
                  variant="outline"
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Selecione um usuário primeiro:</Label>
                <Select
                  value={selectedUser}
                  onValueChange={setSelectedUser}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin mx-auto h-8 w-8 border-b-2 border-primary rounded-full"></div>
                  <p className="text-sm text-muted-foreground mt-2">Carregando instâncias...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Instâncias encontradas:</Label>
                  {availableInstances.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      Nenhuma instância encontrada na Evolution API
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      {availableInstances.map((instance) => (
                        <Card key={instance.instanceName} className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium">{instance.instanceName}</div>
                              <div className="text-sm text-muted-foreground">
                                Status: {instance.status} | Perfil: {instance.profileName || 'N/A'}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {instance.isAlreadyAdded ? (
                                <Badge variant="secondary">
                                  <Check className="h-3 w-3 mr-1" />
                                  Já adicionada
                                </Badge>
                              ) : (
                                <Button
                                  onClick={() => addSelectedInstance(instance.instanceName)}
                                  disabled={!selectedUser || loading}
                                  size="sm"
                                >
                                  Adicionar
                                </Button>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={resetForm}
                  variant="outline"
                >
                  Fechar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Formulário de edição simplificado */}
        {showForm && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">
                Editar Instância: {selectedInstance}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Usuário Responsável</Label>
                  <Select
                    value={selectedUser}
                    onValueChange={setSelectedUser}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um usuário" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={updateInstance}
                    disabled={loading || !selectedUser}
                  >
                    {loading ? "Atualizando..." : "Atualizar"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de instâncias configuradas */}
        <div className="space-y-4">
          {instances.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  Nenhuma instância configurada. Use o botão "Buscar Instâncias" para adicionar.
                </div>
              </CardContent>
            </Card>
          ) : (
            instances.map((instance) => (
              <Card key={instance.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {instance.instance_name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={instance.is_active ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => toggleInstanceStatus(instance.id, instance.is_active)}
                    >
                      {instance.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(instance)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteInstance(instance.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>Usuário:</strong> {instance.user_name} ({instance.user_email})</p>
                    <p><strong>ID Evolution:</strong> {instance.evolution_instance_id || 'Não configurado'}</p>
                    <p><strong>Status:</strong> Conectado à Evolution API</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};