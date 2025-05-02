
import { Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Notification } from '@/lib/types';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <div
      className={cn(
        'flex items-start gap-2 p-3 hover:bg-accent/50 transition-colors cursor-default',
        !notification.read && 'bg-accent/20'
      )}
    >
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm', !notification.read && 'font-medium')}>
          {notification.message}
        </p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-muted-foreground">{timeAgo}</p>
          {!notification.read && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10"
              onClick={() => onMarkAsRead(notification.id)}
            >
              <Check className="h-3 w-3 mr-1" />
              Marcar como lida
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
