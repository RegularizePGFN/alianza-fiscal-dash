import { User } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NotificationsPopover } from "@/components/layout/NotificationsPopover";
export function AppHeader() {
  return <header className="sticky top-0 z-50 h-14 flex items-center gap-4 border-b bg-header px-4 md:px-6 dark:border-gray-800 dark:bg-gray-900/80 dark:backdrop-blur-sm app-header">
      
      
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <NotificationsPopover />
        
        <Link to="/perfil" className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/50 hover:bg-muted">
          <span className="sr-only">Perfil</span>
          <User className="h-4 w-4" />
        </Link>
      </div>
    </header>;
}