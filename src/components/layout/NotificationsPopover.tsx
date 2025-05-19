
import { NotificationsPopover as OriginalNotificationsPopover } from '@/components/notifications/NotificationsPopover';

// This is a simple re-export to maintain the import in AppHeader.tsx
export function NotificationsPopover() {
  return <OriginalNotificationsPopover />;
}
