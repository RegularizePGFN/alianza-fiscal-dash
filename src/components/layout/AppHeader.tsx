
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationsPopover } from "@/components/notifications/NotificationsPopover";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppHeaderProps {
  onMobileMenuClick?: () => void;
}

export function AppHeader({ onMobileMenuClick }: AppHeaderProps) {
  const isMobile = useIsMobile();

  return (
    <header className="border-b border-gray-200 bg-white px-4 h-14 flex items-center justify-between shadow-sm">
      {/* Botão de menu para dispositivos móveis */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onMobileMenuClick}
          className="md:hidden mr-2"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      )}
      
      <div className="flex items-center space-x-1">
        <h3 className={`font-semibold ${isMobile ? "text-sm" : "text-base"}`}>
          Aliança Fiscal
        </h3>
      </div>
      
      <div className="flex items-center">
        <NotificationsPopover />
      </div>
    </header>
  );
}
