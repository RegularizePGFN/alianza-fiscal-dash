import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
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
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Phone, User, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface CreateAgendamentoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editingMessage?: {
    id: string;
    client_name: string;
    client_phone: string;
    message_text: string;
    scheduled_date: string;
    status: string;
    instance_name: string;
    user_id: string;
    sent_at?: string;
    error_message?: string;
    created_at: string;
    updated_at: string;
    requires_approval?: boolean;
    profiles?: {
      name: string;
      email: string;
    };
  } | null;
}

interface UserInstance {
  id: string;
  instance_name: string;
  evolution_instance_id?: string;
  evolution_api_url?: string;
  evolution_api_key?: string;
  user_id: string;
  profiles?: {
    name: string;
  };
}

interface Contact {
  id: string;
  name: string;
  phone: string;
  remoteJid: string;
  profilePicUrl?: string;
}

export const CreateAgendamentoModal = ({ 
  open, 
  onOpenChange, 
  onSuccess,
  editingMessage 
}: CreateAgendamentoModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [searchPhone, setSearchPhone] = useState("");
  const [searchingPhone, setSearchingPhone] = useState(false);
  const [step, setStep] = useState<'instance' | 'contact' | 'details'>('instance');
  const [instances, setInstances] = useState<UserInstance[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<string>("");
  const [selectedContact, setSelectedContact] = useState<string>("");
  const [formData, setFormData] = useState({
    clientName: "",
    clientPhone: "",
    messageText: "",
    scheduledDate: "",
    scheduledTime: "",
  });

  const resetForm = () => {
    if (editingMessage) {
      // Se estiver editando, popular com os dados da mensagem
      const scheduledDate = new Date(editingMessage.scheduled_date);
      setFormData({
        clientName: editingMessage.client_name,
        clientPhone: editingMessage.client_phone,
        messageText: editingMessage.message_text,
        scheduledDate: format(scheduledDate, 'yyyy-MM-dd'),
        scheduledTime: format(scheduledDate, 'HH:mm'),
      });
      setSelectedInstance(editingMessage.instance_name);
      setStep('details');
    } else {
      setFormData({
        clientName: "",
        clientPhone: "",
        messageText: "",
        scheduledDate: "",
        scheduledTime: "",
      });
      setStep('instance');
      setSelectedInstance("");
      setSelectedContact("");
      setContacts([]);
      setSearchPhone("");
    }
  };

  const fetchUserInstances = async () => {
    if (!user) return;

    try {
      // Se for admin, buscar todas as instâncias ativas, caso contrário apenas as do usuário
      let query = supabase
        .from('user_whatsapp_instances')
        .select(`
          id, 
          instance_name, 
          evolution_instance_id, 
          evolution_api_url, 
          evolution_api_key,
          user_id
        `)
        .eq('is_active', true);

      // Se não for admin, filtrar apenas instâncias do usuário
      if (user.role !== 'admin') {
        query = query.eq('user_id', user.id);
      }

      const { data: instancesData, error } = await query;

      if (error) throw error;

      // Se for admin, buscar informações dos usuários das instâncias
      if (user.role === 'admin' && instancesData && instancesData.length > 0) {
        const userIds = [...new Set(instancesData.map(inst => inst.user_id).filter(Boolean))] as string[];
        
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', userIds);

        // Combinar dados
        const instancesWithProfiles = instancesData.map(instance => {
          const profile = profilesData?.find(p => p.id === instance.user_id);
          return {
            ...instance,
            profiles: profile ? { name: profile.name } : undefined
          };
        });

        setInstances(instancesWithProfiles);
      } else {
        setInstances(instancesData || []);
      }
    } catch (error: any) {
      console.error('Error fetching instances:', error);
      toast({
        title: "Erro ao carregar instâncias",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchInstanceContacts = async (instanceName: string, phoneSearch?: string) => {
    if (!user || !instanceName) return;

    setLoadingContacts(true);
    try {
      console.log(`🔍 Fetching contacts for instance: ${instanceName}`);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      // Buscar o user_id da instância (para admins que podem usar instâncias de outros usuários)
      const { data: instanceData, error: instanceError } = await supabase
        .from('user_whatsapp_instances')
        .select('user_id, evolution_instance_id, evolution_api_url, evolution_api_key')
        .eq('instance_name', instanceName)
        .eq('is_active', true)
        .single();

      if (instanceError || !instanceData) {
        console.error('❌ Instance not found:', instanceError);
        throw new Error(`Instância ${instanceName} não encontrada ou inativa`);
      }

      console.log(`📋 Instance data:`, instanceData);

      const targetUserId = instanceData.user_id || user.id;

      console.log(`🔧 Calling get-instance-contacts with:`, {
        instanceName,
        userId: targetUserId,
        evolution_instance_id: instanceData.evolution_instance_id
      });

      const response = await fetch('https://sbxltdbnqixucjoognfj.supabase.co/functions/v1/get-instance-contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          instanceName,
          userId: targetUserId,
          phoneSearch: phoneSearch || null,
        }),
      });

      console.log(`📡 API response status:`, response.status);

      const data = await response.json();
      console.log(`📋 API response data:`, data);
      
      if (data.error) {
        console.error('❌ API returned error:', data.error);
        throw new Error(data.error);
      }

      console.log(`✅ Received ${data.contacts?.length || 0} contacts`);
      setContacts(data.contacts || []);
      
      if (data.contacts?.length === 0) {
        toast({
          title: "Nenhum contato encontrado",
          description: "Esta instância não possui conversas recentes.",
        });
      }
    } catch (error: any) {
      console.error('Error fetching contacts:', error);
      toast({
        title: "Erro ao carregar contatos",
        description: error.message,
        variant: "destructive",
      });
      setContacts([]);
    } finally {
      setLoadingContacts(false);
    }
  };

  const searchByPhone = async () => {
    if (!searchPhone.trim() || searchPhone.length < 3) {
      toast({
        title: "Número muito curto",
        description: "Digite pelo menos 3 números para buscar.",
        variant: "destructive",
      });
      return;
    }

    setSearchingPhone(true);
    try {
      await fetchInstanceContacts(selectedInstance, searchPhone.trim());
    } finally {
      setSearchingPhone(false);
    }
  };

  const handleInstanceSelect = (instanceName: string) => {
    setSelectedInstance(instanceName);
    setStep('contact');
    fetchInstanceContacts(instanceName);
  };

  const handleContactSelect = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (contact) {
      setSelectedContact(contactId);
      setFormData(prev => ({
        ...prev,
        clientName: contact.name,
        clientPhone: contact.phone,
      }));
      setStep('details');
    }
  };

  const handleManualContact = () => {
    setSelectedContact("");
    setFormData(prev => ({
      ...prev,
      clientName: "",
      clientPhone: "",
    }));
    setStep('details');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedInstance) return;

    setLoading(true);
    try {
      // Combinar data e hora
      const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);

      if (editingMessage) {
        // Modo edição - atualizar agendamento existente
        const { error } = await supabase
          .from('scheduled_messages')
          .update({
            client_name: formData.clientName,
            client_phone: formData.clientPhone,
            message_text: formData.messageText,
            scheduled_date: scheduledDateTime.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingMessage.id);

        if (error) throw error;

        toast({
          title: "Agendamento atualizado",
          description: "Sua mensagem foi atualizada com sucesso.",
        });
      } else {
        // Modo criação - inserir novo agendamento
        const { error } = await supabase
          .from('scheduled_messages')
          .insert({
            user_id: user.id,
            instance_name: selectedInstance,
            client_name: formData.clientName,
            client_phone: formData.clientPhone,
            message_text: formData.messageText,
            scheduled_date: scheduledDateTime.toISOString(),
            status: 'pending',
          });

        if (error) throw error;

        toast({
          title: "Agendamento criado",
          description: "Sua mensagem foi agendada com sucesso.",
        });

        // Tentar processar mensagens imediatamente se a data agendada já passou
        const now = new Date();
        if (scheduledDateTime <= now) {
          toast({
            title: "Processando mensagem",
            description: "Tentando enviar a mensagem agora...",
          });
          
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              await fetch('https://sbxltdbnqixucjoognfj.supabase.co/functions/v1/send-scheduled-messages', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${session.access_token}`,
                },
              });
            }
          } catch (processError) {
            console.error('Error processing immediate message:', processError);
          }
        }
      }

      resetForm();
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving scheduled message:', error);
      toast({
        title: editingMessage ? "Erro ao atualizar agendamento" : "Erro ao criar agendamento",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchUserInstances();
    } else {
      resetForm();
    }
  }, [open]);

  // Adicionar useEffect para popular dados quando editingMessage mudar
  useEffect(() => {
    if (editingMessage && open) {
      const scheduledDate = new Date(editingMessage.scheduled_date);
      setFormData({
        clientName: editingMessage.client_name,
        clientPhone: editingMessage.client_phone,
        messageText: editingMessage.message_text,
        scheduledDate: format(scheduledDate, 'yyyy-MM-dd'),
        scheduledTime: format(scheduledDate, 'HH:mm'),
      });
      setSelectedInstance(editingMessage.instance_name);
      setStep('details');
    }
  }, [editingMessage, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            {editingMessage ? 'Editar Agendamento' : 'Novo Agendamento'}
            {!editingMessage && step === 'instance' && ' - Selecionar Instância'}
            {!editingMessage && step === 'contact' && ' - Selecionar Contato'}
            {step === 'details' && ' - Detalhes da Mensagem'}
          </DialogTitle>
        </DialogHeader>

        {!editingMessage && step === 'instance' && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Primeiro, selecione a instância do WhatsApp que será usada para enviar a mensagem.
            </div>
            
            <div className="space-y-3">
              {instances.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold text-foreground">
                    Nenhuma instância ativa
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Configure suas instâncias no painel administrativo.
                  </p>
                </div>
              ) : (
                instances.map((instance) => (
                  <div
                    key={instance.id}
                    onClick={() => handleInstanceSelect(instance.instance_name)}
                    className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{instance.instance_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {instance.evolution_instance_id || 'ID não configurado'}
                        </p>
                        {instance.profiles && user?.role === 'admin' && (
                          <p className="text-xs text-muted-foreground">
                            Usuário: {instance.profiles.name}
                          </p>
                        )}
                      </div>
                      <div className="text-primary">→</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {!editingMessage && step === 'contact' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setStep('instance')}
              >
                ← Voltar para Instâncias
              </Button>
            </div>
            
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Digite um número para buscar (ex: 5534999)"
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value.replace(/\D/g, ''))}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        searchByPhone();
                      }
                    }}
                  />
                </div>
                <Button
                  onClick={searchByPhone}
                  disabled={searchingPhone || !searchPhone.trim() || searchPhone.length < 3}
                >
                  {searchingPhone ? 'Buscando...' : 'Buscar'}
                </Button>
              </div>
              
              <Button
                variant="outline"
                onClick={handleManualContact}
                className="w-full"
              >
                <User className="h-4 w-4 mr-2" />
                Digitar Manualmente (Sem Buscar)
              </Button>
            </div>

            {loadingContacts ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Carregando conversas recentes...
                </p>
              </div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-8">
                <Phone className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold text-foreground">
                  Nenhuma conversa encontrada
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Esta instância não possui conversas recentes ou não foi possível conectar. Tente buscar por um número específico.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => handleContactSelect(contact.id)}
                    className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    {contact.profilePicUrl ? (
                      <img
                        src={contact.profilePicUrl}
                        alt={contact.name}
                        className="w-10 h-10 rounded-full"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{contact.name}</div>
                      <div className="text-sm text-muted-foreground">{contact.phone}</div>
                    </div>
                    <div className="text-primary">→</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 'details' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Instância: <strong>{selectedInstance}</strong>
              </div>
              {!editingMessage && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setStep('contact')}
                >
                  ← Voltar
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Nome do Cliente</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                  placeholder="Nome do cliente"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clientPhone">Telefone</Label>
                <Input
                  id="clientPhone"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
                  placeholder="5534999999999"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="messageText">Mensagem</Label>
              <Textarea
                id="messageText"
                value={formData.messageText}
                onChange={(e) => setFormData(prev => ({ ...prev, messageText: e.target.value }))}
                placeholder="Digite a mensagem que será enviada..."
                className="min-h-[100px]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduledDate">Data</Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  min={editingMessage ? undefined : format(new Date(), 'yyyy-MM-dd')}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="scheduledTime">Horário</Label>
                <Input
                  id="scheduledTime"
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? (editingMessage ? "Salvando..." : "Agendando...") : (editingMessage ? "Salvar Alterações" : "Agendar Mensagem")}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};