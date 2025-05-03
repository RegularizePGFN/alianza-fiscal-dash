
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
import { useNotifications } from '@/hooks/notifications/useNotifications';

interface NotificationsPopoverProps {
  onNotificationsChange?: (hasUnread: boolean) => void;
}

export function NotificationsPopover({ onNotificationsChange }: NotificationsPopoverProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  
  const { 
    notifications, 
    loading, 
    hasUnread,
    markAsRead, 
    markAllAsRead 
  } = useNotifications(user?.id);
  
  // Move the notification status change effect to a proper useEffect to avoid
  // calling the function during render which can cause render loops
  useEffect(() => {
    if (onNotificationsChange && hasUnread !== undefined) {
      onNotificationsChange(hasUnread);
    }
  }, [onNotificationsChange, hasUnread]);
  
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
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
        />
      </PopoverContent>
    </Popover>
  );
}
