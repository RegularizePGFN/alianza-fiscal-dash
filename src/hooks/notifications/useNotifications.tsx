
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Notification } from "@/lib/types";

export function useNotifications(userId: string | undefined) {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasUnread, setHasUnread] = useState(false);

  // Fetch notifications from Supabase
  const fetchNotifications = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setNotifications(data || []);
      setHasUnread(data?.some(notification => !notification.read) || false);
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as notificações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", id);

      if (error) throw error;

      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
      
      // Check if there are still unread notifications
      setHasUnread(notifications.some(n => n.id !== id && !n.read));
    } catch (error: any) {
      console.error("Error marking notification as read:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a notificação.",
        variant: "destructive",
      });
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", userId);

      if (error) throw error;

      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      setHasUnread(false);
    } catch (error: any) {
      console.error("Error marking all notifications as read:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar as notificações.",
        variant: "destructive",
      });
    }
  };

  // Fetch notifications on initial load and when userId changes
  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

  return { 
    notifications, 
    loading, 
    hasUnread,
    fetchNotifications, 
    markAsRead, 
    markAllAsRead 
  };
}
