
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Notification } from '@/lib/types';
import { NotificationItem } from '@/components/notifications/NotificationItem';

interface NotificationsListProps {
  notifications: Notification[];
  loading: boolean;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export function NotificationsList({
  notifications,
  loading,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationsListProps) {
  const hasUnread = notifications.some(n => !n.read);
  
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold text-sm">Notificações</h3>
        {hasUnread && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
            onClick={onMarkAllAsRead}
            disabled={loading}
          >
            <Check className="h-3.5 w-3.5 mr-1" />
            Marcar todas como lidas
          </Button>
        )}
      </div>

      <ScrollArea className="h-[350px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-32">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <p className="text-xs text-muted-foreground mt-2">Carregando notificações...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center p-4">
            <p className="text-sm text-muted-foreground">Você não tem notificações.</p>
          </div>
        ) : (
          <div className="py-1">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={onMarkAsRead}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
