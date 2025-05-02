
import { useState, useEffect } from 'react';
import { Bell, BellDot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAuth } from '@/contexts/auth';
import { NotificationsList } from '@/components/notifications/NotificationsList';
import { Notification } from '@/lib/types';
import { fetchNotificationsForUser } from '@/hooks/notifications/useNotifications';

interface NotificationsPopoverProps {
  onNotificationsChange?: (hasUnread: boolean) => void;
}

export function NotificationsPopover({ onNotificationsChange }: NotificationsPopoverProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  
  useEffect(() => {
    if (user?.id) {
      loadNotifications();
    }
  }, [user]);
  
  const loadNotifications = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // This is a mock implementation - in a real app you'd fetch from the database
      const userNotifications = await fetchNotificationsForUser(user.id);
      setNotifications(userNotifications);
      
      // Check if there are any unread notifications
      const unreadExists = userNotifications.some(notif => !notif.read);
      setHasUnread(unreadExists);
      
      // Propagate notification status to parent component
      if (onNotificationsChange) {
        onNotificationsChange(unreadExists);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleMarkAsRead = async (notificationId: string) => {
    // Mark a single notification as read
    setNotifications(prevNotifs =>
      prevNotifs.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    
    // Update unread status
    const stillHasUnread = notifications.some(
      notif => notif.id !== notificationId && !notif.read
    );
    setHasUnread(stillHasUnread);
    if (onNotificationsChange) {
      onNotificationsChange(stillHasUnread);
    }
    
    // Here you would update the notification in the database
  };
  
  const handleMarkAllAsRead = async () => {
    // Mark all notifications as read
    setNotifications(prevNotifs =>
      prevNotifs.map(notif => ({ ...notif, read: true }))
    );
    setHasUnread(false);
    if (onNotificationsChange) {
      onNotificationsChange(false);
    }
    
    // Here you would update all notifications in the database
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          {hasUnread ? (
            <>
              <BellDot className="h-5 w-5" />
              <span className="sr-only">Notificações não lidas</span>
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
            </>
          ) : (
            <>
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notificações</span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <NotificationsList
          notifications={notifications}
          loading={loading}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
        />
      </PopoverContent>
    </Popover>
  );
}
