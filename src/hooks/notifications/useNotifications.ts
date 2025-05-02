
import { supabase } from "@/integrations/supabase/client";
import { Notification } from "@/lib/types";

// This is a mock function to simulate fetching notifications from a database
// In a real application, you would replace this with actual database queries
export async function fetchNotificationsForUser(userId: string): Promise<Notification[]> {
  // For demo purposes, we're returning mock notifications
  // In a real app, you would fetch from Supabase like this:
  // const { data, error } = await supabase
  //   .from('notifications')
  //   .select('*')
  //   .eq('user_id', userId)
  //   .order('created_at', { ascending: false });

  // Simulate a loading delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Return mock notifications for demonstration
  return [
    {
      id: '1',
      user_id: userId,
      message: 'Sua meta mensal foi atualizada pelo administrador.',
      type: 'goal_update',
      read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    },
    {
      id: '2',
      user_id: userId,
      message: 'Parabéns! Você atingiu 75% da sua meta mensal.',
      type: 'goal_milestone',
      read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    },
    {
      id: '3',
      user_id: userId,
      message: 'Sua venda para o cliente João Silva foi registrada com sucesso.',
      type: 'sale_created',
      read: true,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    },
    {
      id: '4',
      user_id: userId,
      message: 'Novo treinamento disponível: Técnicas avançadas de vendas.',
      type: 'training',
      read: true,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    },
  ];
}
