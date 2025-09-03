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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Plus, Edit, RefreshCw, Check, UserPlus, UserMinus, Users } from "lucide-react";
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
  users?: InstanceUser[];
}

interface InstanceUser {
  user_id: string;
  name: string;
  email: string;
  access_type: string;
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
  owner?: string;
  number?: string;
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
      // Buscar instâncias com usuários associados
      const { data: instancesData, error: instancesError } = await supabase
        .from('user_whatsapp_instances')
        .select(`
          *,
          user_instance_access (
            user_id,
            access_type,
            profiles:user_id (
              name,
              email
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (instancesError) throw instancesError;

      // Buscar usuários
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, name, email')
        .order('name');

      if (usersError) throw usersError;

      // Processar dados das instâncias
      const processedInstances = instancesData?.map(instance => {
        const mainUser = usersData?.find(u => u.id === instance.user_id);
        const instanceUsers = instance.user_instance_access?.map((access: any) => ({
          user_id: access.user_id,
          name: access.profiles?.name || 'Usuário não encontrado',
          email: access.profiles?.email || '',
          access_type: access.access_type
        })) || [];

        return {
          ...instance,
          user_name: mainUser?.name,
          user_email: mainUser?.email,
          users: instanceUsers,
        };
      }) || [];

      setInstances(processedInstances);
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
      console.log("🔄 Fetching available instances...");
      const { data, error } = await supabase.functions.invoke('list-available-instances');
      
      if (error) throw error;
      
      console.log("📋 Received data from function:", data);
      console.log("📋 Instances array:", data.instances);
      
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
    console.log("🔄 addSelectedInstance called with:", { instanceName, selectedUser });
    
    if (!selectedUser) {
      toast({
        title: "Erro",
        description: "Selecione um usuário primeiro.",
        variant: "destructive",
      });
      return;
    }

    if (!instanceName || instanceName.trim() === '') {
      toast({
        title: "Erro",
        description: "Nome da instância é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // 1. Criar a instância
      const instanceData = {
        user_id: selectedUser,
        instance_name: instanceName.trim(),
        evolution_instance_id: instanceName.trim(),
        evolution_api_url: "https://evoapi.neumocrm.com.br/",
        evolution_api_key: "a9e018ea0e146a0a4ecf1dd0233e7ccf",
        is_active: true,
      };
      
      console.log("📝 Inserting instance data:", instanceData);

      const { data: newInstance, error: instanceError } = await supabase
        .from('user_whatsapp_instances')
        .insert(instanceData)
        .select()
        .single();

      if (instanceError) throw instanceError;

      // 2. Adicionar acesso do usuário à instância
      const { error: accessError } = await supabase
        .from('user_instance_access')
        .insert({
          user_id: selectedUser,
          instance_id: newInstance.id,
          access_type: 'owner'
        });

      if (accessError) throw accessError;

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

  const addUserToInstance = async (instanceId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('user_instance_access')
        .insert({
          user_id: userId,
          instance_id: instanceId,
          access_type: 'user'
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Erro",
            description: "Este usuário já tem acesso a esta instância.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Usuário adicionado",
        description: "Usuário foi adicionado à instância com sucesso.",
      });

      fetchData();
    } catch (error: any) {
      console.error('Error adding user to instance:', error);
      toast({
        title: "Erro ao adicionar usuário",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const removeUserFromInstance = async (instanceId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('user_instance_access')
        .delete()
        .eq('instance_id', instanceId)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Usuário removido",
        description: "Usuário foi removido da instância com sucesso.",
      });

      fetchData();
    } catch (error: any) {
      console.error('Error removing user from instance:', error);
      toast({
        title: "Erro ao remover usuário",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (instance: UserInstance) => {
    setEditingInstance(instance);
    setSelectedUser(instance.user_id);
    setSelectedInstance(instance.instance_name);
    setShowForm(true);
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
      // A exclusão em cascata removerá automaticamente os acessos
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
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
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
                <Label>Selecione um usuário responsável:</Label>
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
                    <Tabs defaultValue="not-added" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="not-added">
                          Não Adicionadas ({availableInstances.filter(i => !i.isAlreadyAdded).length})
                        </TabsTrigger>
                        <TabsTrigger value="already-added">
                          Já Adicionadas ({availableInstances.filter(i => i.isAlreadyAdded).length})
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="not-added" className="mt-4">
                        <div className="grid gap-2">
                          {availableInstances.filter(instance => !instance.isAlreadyAdded).length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground">
                              Todas as instâncias já foram adicionadas
                            </div>
                          ) : (
                            availableInstances
                              .filter(instance => !instance.isAlreadyAdded)
                              .map((instance) => (
                                <Card key={instance.instanceName} className="p-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="font-medium">{instance.instanceName}</div>
                                      <div className="text-sm text-muted-foreground">
                                        {instance.status === 'open' ? 'Conectado' : 'Desconectado'} | {instance.profileName || 'N/A'} | {instance.number || 'N/A'}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        onClick={() => {
                                          console.log("🔄 Button clicked for instance:", instance.instanceName);
                                          addSelectedInstance(instance.instanceName);
                                        }}
                                        disabled={!selectedUser || loading}
                                        size="sm"
                                      >
                                        Adicionar
                                      </Button>
                                    </div>
                                  </div>
                                </Card>
                              ))
                          )}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="already-added" className="mt-4">
                        <div className="grid gap-2">
                          {availableInstances.filter(instance => instance.isAlreadyAdded).length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground">
                              Nenhuma instância foi adicionada ainda
                            </div>
                          ) : (
                            availableInstances
                              .filter(instance => instance.isAlreadyAdded)
                              .map((instance) => (
                                <Card key={instance.instanceName} className="p-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="font-medium">{instance.instanceName}</div>
                                      <div className="text-sm text-muted-foreground">
                                        {instance.status === 'open' ? 'Conectado' : 'Desconectado'} | {instance.profileName || 'N/A'} | {instance.number || 'N/A'}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                                        <Check className="h-3 w-3 mr-1" />
                                        Já adicionada
                                      </Badge>
                                    </div>
                                  </div>
                                </Card>
                              ))
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
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
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-medium">
                      {instance.instance_name}
                    </CardTitle>
                    <Badge 
                      variant={instance.is_active ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => toggleInstanceStatus(instance.id, instance.is_active)}
                    >
                      {instance.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
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
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>ID Evolution:</strong> {instance.evolution_instance_id || 'Não configurado'}</p>
                      <p><strong>Status:</strong> Conectado à Evolution API</p>
                    </div>

                    {/* Usuários com acesso */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Usuários com acesso ({instance.users?.length || 0})
                        </h4>
                        <div className="flex items-center gap-2">
                          <Select
                            onValueChange={(userId) => {
                              if (userId) {
                                addUserToInstance(instance.id, userId);
                              }
                            }}
                          >
                            <SelectTrigger className="w-[200px] h-8">
                              <SelectValue placeholder="Adicionar usuário" />
                            </SelectTrigger>
                            <SelectContent>
                              {users
                                .filter(user => !instance.users?.some(u => u.user_id === user.id))
                                .map((user) => (
                                  <SelectItem key={user.id} value={user.id}>
                                    {user.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {instance.users && instance.users.length > 0 ? (
                        <div className="grid gap-2">
                          {instance.users.map((user) => (
                            <div key={user.user_id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                              <div className="flex items-center gap-2">
                                <Badge variant={user.access_type === 'owner' ? 'default' : 'secondary'}>
                                  {user.access_type === 'owner' ? 'Responsável' : 'Usuário'}
                                </Badge>
                                <span className="text-sm font-medium">{user.name}</span>
                                <span className="text-xs text-muted-foreground">({user.email})</span>
                              </div>
                              {user.access_type !== 'owner' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeUserFromInstance(instance.id, user.user_id)}
                                  className="text-destructive hover:text-destructive p-1 h-8 w-8"
                                >
                                  <UserMinus className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground text-center py-2">
                          Nenhum usuário com acesso ainda
                        </div>
                      )}
                    </div>
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