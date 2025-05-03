
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Notification } from "@/lib/types";

export function useNotifications(userId: string | undefined) {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasUnread, setHasUnread] = useState(false);
  
  // Add a ref to track mounted state to prevent state updates after unmount
  const isMountedRef = useRef(true);
  
  // Add a ref to track if fetch is in progress to prevent duplicate fetches
  const fetchInProgressRef = useRef(false);

  // Fetch notifications from Supabase
  const fetchNotifications = async () => {
    if (!userId || fetchInProgressRef.current) return;
    
    fetchInProgressRef.current = true;
    setLoading(true);
    
    try {
      console.log("Fetching notifications for user:", userId);
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (isMountedRef.current) {
        setNotifications(data || []);
        const unreadExists = data?.some(notification => !notification.read) || false;
        setHasUnread(unreadExists);
      }
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
      if (isMountedRef.current) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar as notificações.",
          variant: "destructive",
        });
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
      fetchInProgressRef.current = false;
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
      const updatedNotifications = notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      );
      setHasUnread(updatedNotifications.some(n => !n.read));
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
    if (!userId) return;
    
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
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMountedRef.current = false;
    };
  }, [userId]);

  // Reset isMountedRef when component mounts
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return { 
    notifications, 
    loading, 
    hasUnread,
    fetchNotifications, 
    markAsRead, 
    markAllAsRead 
  };
}
