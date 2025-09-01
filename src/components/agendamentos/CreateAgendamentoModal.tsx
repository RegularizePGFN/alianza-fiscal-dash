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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface CreateAgendamentoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface WhatsAppInstance {
  instance_name: string;
}

export const CreateAgendamentoModal = ({ 
  open, 
  onOpenChange, 
  onSuccess 
}: CreateAgendamentoModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [instances, setInstances] = useState<WhatsAppInstance[]>([]);
  const [formData, setFormData] = useState({
    client_name: "",
    client_phone: "",
    message_text: "",
    scheduled_date: "",
    scheduled_time: "",
    instance_name: "",
  });

  const fetchUserInstances = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_whatsapp_instances')
        .select('instance_name')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      setInstances(data || []);
    } catch (error: any) {
      console.error('Error fetching instances:', error);
      toast({
        title: "Erro ao carregar instâncias",
        description: "Você precisa ter pelo menos uma instância do WhatsApp configurada.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Combinar data e hora
      const scheduledDateTime = new Date(`${formData.scheduled_date}T${formData.scheduled_time}`);

      const { error } = await supabase
        .from('scheduled_messages')
        .insert({
          user_id: user.id,
          client_name: formData.client_name,
          client_phone: formData.client_phone,
          message_text: formData.message_text,
          scheduled_date: scheduledDateTime.toISOString(),
          instance_name: formData.instance_name,
          status: 'pending',
        });

      if (error) throw error;

      toast({
        title: "Agendamento criado",
        description: "Sua mensagem foi agendada com sucesso.",
      });

      // Reset form
      setFormData({
        client_name: "",
        client_phone: "",
        message_text: "",
        scheduled_date: "",
        scheduled_time: "",
        instance_name: "",
      });

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
    }
  }, [open, user]);

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Agendamento</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client_name">Nome do Cliente</Label>
            <Input
              id="client_name"
              value={formData.client_name}
              onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
              placeholder="Digite o nome do cliente"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client_phone">Telefone do Cliente</Label>
            <Input
              id="client_phone"
              value={formData.client_phone}
              onChange={(e) => setFormData(prev => ({ ...prev, client_phone: e.target.value }))}
              placeholder="Ex: 5511999999999"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instance_name">Instância WhatsApp</Label>
            <Select
              value={formData.instance_name}
              onValueChange={(value) => setFormData(prev => ({ ...prev, instance_name: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma instância" />
              </SelectTrigger>
              <SelectContent>
                {instances.map((instance) => (
                  <SelectItem key={instance.instance_name} value={instance.instance_name}>
                    {instance.instance_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {instances.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhuma instância disponível. Contate o administrador.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduled_date">Data</Label>
              <Input
                id="scheduled_date"
                type="date"
                value={formData.scheduled_date}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                min={today}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduled_time">Horário</Label>
              <Input
                id="scheduled_time"
                type="time"
                value={formData.scheduled_time}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduled_time: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message_text">Mensagem</Label>
            <Textarea
              id="message_text"
              value={formData.message_text}
              onChange={(e) => setFormData(prev => ({ ...prev, message_text: e.target.value }))}
              placeholder="Digite a mensagem que será enviada..."
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || instances.length === 0}
            >
              {loading ? "Criando..." : "Criar Agendamento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};