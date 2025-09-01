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
}

interface UserInstance {
  id: string;
  instance_name: string;
  evolution_instance_id?: string;
  evolution_api_url?: string;
  evolution_api_key?: string;
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
  onSuccess 
}: CreateAgendamentoModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(false);
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
  };

  const fetchUserInstances = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_whatsapp_instances')
        .select('id, instance_name, evolution_instance_id, evolution_api_url, evolution_api_key')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      setInstances(data || []);
    } catch (error: any) {
      console.error('Error fetching instances:', error);
      toast({
        title: "Erro ao carregar instâncias",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchInstanceContacts = async (instanceName: string) => {
    if (!user || !instanceName) return;

    setLoadingContacts(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await fetch('https://sbxltdbnqixucjoognfj.supabase.co/functions/v1/get-instance-contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          instanceName,
          userId: user.id,
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

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

      resetForm();
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating scheduled message:', error);
      toast({
        title: "Erro ao criar agendamento",
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Novo Agendamento
            {step === 'instance' && ' - Selecionar Instância'}
            {step === 'contact' && ' - Selecionar Contato'}
            {step === 'details' && ' - Detalhes da Mensagem'}
          </DialogTitle>
        </DialogHeader>

        {step === 'instance' && (
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
                      </div>
                      <div className="text-primary">→</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {step === 'contact' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Selecione um contato recente ou digite manualmente.
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setStep('instance')}
              >
                ← Voltar
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleManualContact}
                className="flex-1"
              >
                <User className="h-4 w-4 mr-2" />
                Digitar Manualmente
              </Button>
            </div>

            {loadingContacts ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Carregando contatos...
                </p>
              </div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-8">
                <Phone className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold text-foreground">
                  Nenhum contato encontrado
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Esta instância não possui conversas recentes ou não foi possível conectar.
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
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setStep('contact')}
              >
                ← Voltar
              </Button>
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
                  min={format(new Date(), 'yyyy-MM-dd')}
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
                {loading ? "Agendando..." : "Agendar Mensagem"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};