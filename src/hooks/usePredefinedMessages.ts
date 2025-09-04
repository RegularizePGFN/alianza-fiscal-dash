import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export interface PredefinedMessage {
  id: string;
  user_id: string;
  name: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export const usePredefinedMessages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<PredefinedMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('predefined_messages')
        .select('*')
        .order('name');

      if (error) throw error;

      setMessages(data || []);
    } catch (error: any) {
      console.error('Error fetching predefined messages:', error);
      toast.error('Erro ao carregar mensagens pré-definidas');
    } finally {
      setLoading(false);
    }
  };

  const createMessage = async (name: string, content: string) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('predefined_messages')
        .insert([
          {
            user_id: user.id,
            name: name.trim(),
            content: content.trim(),
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setMessages(prev => [...prev, data]);
      toast.success('Mensagem pré-definida criada com sucesso');
      return true;
    } catch (error: any) {
      console.error('Error creating predefined message:', error);
      toast.error('Erro ao criar mensagem pré-definida');
      return false;
    }
  };

  const updateMessage = async (id: string, name: string, content: string) => {
    try {
      const { data, error } = await supabase
        .from('predefined_messages')
        .update({
          name: name.trim(),
          content: content.trim(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setMessages(prev => prev.map(msg => msg.id === id ? data : msg));
      toast.success('Mensagem pré-definida atualizada com sucesso');
      return true;
    } catch (error: any) {
      console.error('Error updating predefined message:', error);
      toast.error('Erro ao atualizar mensagem pré-definida');
      return false;
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('predefined_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMessages(prev => prev.filter(msg => msg.id !== id));
      toast.success('Mensagem pré-definida removida com sucesso');
      return true;
    } catch (error: any) {
      console.error('Error deleting predefined message:', error);
      toast.error('Erro ao remover mensagem pré-definida');
      return false;
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [user]);

  return {
    messages,
    loading,
    createMessage,
    updateMessage,
    deleteMessage,
    refetch: fetchMessages,
  };
};