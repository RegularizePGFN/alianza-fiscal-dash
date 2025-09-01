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
import { Trash2, Plus, Edit } from "lucide-react";
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

export const AdminInstancesModal = ({ 
  open, 
  onOpenChange, 
  onSuccess 
}: AdminInstancesModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [instances, setInstances] = useState<UserInstance[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingInstance, setEditingInstance] = useState<UserInstance | null>(null);
  const [formData, setFormData] = useState({
    user_id: "",
    instance_name: "",
    evolution_instance_id: "",
    evolution_api_url: "http://localhost:8080",
    evolution_api_key: "",
    instance_token: "",
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingInstance) {
        // Atualizar instância existente
        const { error } = await supabase
          .from('user_whatsapp_instances')
          .update({
            user_id: formData.user_id,
            instance_name: formData.instance_name,
            evolution_instance_id: formData.evolution_instance_id,
            evolution_api_url: formData.evolution_api_url,
            evolution_api_key: formData.evolution_api_key,
            instance_token: formData.instance_token || null,
          })
          .eq('id', editingInstance.id);

        if (error) throw error;

        toast({
          title: "Instância atualizada",
          description: "A instância foi atualizada com sucesso.",
        });
      } else {
        // Criar nova instância
        const { error } = await supabase
          .from('user_whatsapp_instances')
          .insert({
            user_id: formData.user_id,
            instance_name: formData.instance_name,
            evolution_instance_id: formData.evolution_instance_id,
            evolution_api_url: formData.evolution_api_url,
            evolution_api_key: formData.evolution_api_key,
            instance_token: formData.instance_token || null,
            is_active: true,
          });

        if (error) throw error;

        toast({
          title: "Instância adicionada",
          description: "A instância foi configurada com sucesso.",
        });
      }

      // Reset form
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Error saving instance:', error);
      toast({
        title: editingInstance ? "Erro ao atualizar instância" : "Erro ao adicionar instância",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      user_id: "",
      instance_name: "",
      evolution_instance_id: "",
      evolution_api_url: "http://localhost:8080",
      evolution_api_key: "",
      instance_token: "",
    });
    setShowForm(false);
    setEditingInstance(null);
  };

  const handleEdit = (instance: UserInstance) => {
    setEditingInstance(instance);
    setFormData({
      user_id: instance.user_id,
      instance_name: instance.instance_name,
      evolution_instance_id: instance.evolution_instance_id || "",
      evolution_api_url: instance.evolution_api_url || "http://localhost:8080",
      evolution_api_key: instance.evolution_api_key || "",
      instance_token: instance.instance_token || "",
    });
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingInstance(null);
    resetForm();
    setShowForm(true);
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
              onClick={handleAddNew}
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nova Instância
            </Button>
          </DialogTitle>
        </DialogHeader>

        {showForm && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">
                {editingInstance ? "Editar Instância" : "Adicionar Nova Instância"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="user_select">Usuário</Label>
                  <Select
                    value={formData.user_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, user_id: value }))}
                    required
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="instance_name">Nome da Instância *</Label>
                    <Input
                      id="instance_name"
                      value={formData.instance_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, instance_name: e.target.value }))}
                      placeholder="Ex: vendedor1_whatsapp"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="evolution_instance_id">ID da Instância Evolution *</Label>
                    <Input
                      id="evolution_instance_id"
                      value={formData.evolution_instance_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, evolution_instance_id: e.target.value }))}
                      placeholder="Ex: my-instance"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="evolution_api_url">URL da Evolution API</Label>
                    <Input
                      id="evolution_api_url"
                      value={formData.evolution_api_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, evolution_api_url: e.target.value }))}
                      placeholder="http://localhost:8080"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="evolution_api_key">Chave da API *</Label>
                    <Input
                      id="evolution_api_key"
                      value={formData.evolution_api_key}
                      onChange={(e) => setFormData(prev => ({ ...prev, evolution_api_key: e.target.value }))}
                      placeholder="Sua chave da Evolution API"
                      type="password"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instance_token">Token da Instância (opcional)</Label>
                  <Input
                    id="instance_token"
                    value={formData.instance_token}
                    onChange={(e) => setFormData(prev => ({ ...prev, instance_token: e.target.value }))}
                    placeholder="Token adicional se necessário"
                  />
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
                    type="submit"
                    disabled={loading}
                  >
                    {loading 
                      ? (editingInstance ? "Atualizando..." : "Adicionando...") 
                      : (editingInstance ? "Atualizar" : "Adicionar")
                    }
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {instances.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  Nenhuma instância configurada.
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
                    <p><strong>API URL:</strong> {instance.evolution_api_url || 'Não configurada'}</p>
                    <p><strong>API Key:</strong> {instance.evolution_api_key ? '••••••••••••••••' : 'Não configurada'}</p>
                    {instance.instance_token && (
                      <p><strong>Token:</strong> {instance.instance_token.substring(0, 20)}...</p>
                    )}
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