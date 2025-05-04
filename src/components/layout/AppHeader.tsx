
import { useAuth } from "@/contexts/auth";
import { UserRole } from "@/lib/types";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NotificationsPopover } from "@/components/notifications/NotificationsPopover";

export function AppHeader() {
  const { user, logout } = useAuth();
  const [hasNotifications, setHasNotifications] = useState(false);
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getRoleDisplay = (role?: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'Administrador';
      case UserRole.SALESPERSON:
        return 'Vendedor';
      default:
        return 'Usuário';
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 py-3 px-6 flex justify-between items-center shadow-sm">
      <h1 className="text-xl font-semibold text-gray-800 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        Intranet Aliança Fiscal
      </h1>
      
      <div className="flex items-center gap-3">
        {user && (
          <>
            <NotificationsPopover onNotificationsChange={setHasNotifications} />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-gray-100 transition-colors duration-200">
                  <Avatar className="h-9 w-9 ring-2 ring-primary/10 transition-all duration-300 hover:ring-primary/30">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 overflow-hidden p-0">
                <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <DropdownMenuLabel className="px-0 py-0">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
                  </DropdownMenuLabel>
                </div>
                <div className="p-2">
                  <div className="px-2 py-1.5">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                      {getRoleDisplay(user.role)}
                    </span>
                  </div>
                  
                  {user.role === UserRole.ADMIN && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/configuracoes" className="flex items-center cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Configurações</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer text-destructive focus:text-destructive hover:bg-destructive/10 transition-colors duration-200" 
                    onClick={logout}
                  >
                    Sair
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    </header>
  );
}
