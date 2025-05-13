
import { Link } from "react-router-dom";
import { NotificationsPopover } from "@/components/notifications/NotificationsPopover";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/contexts/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AppHeader() {
  const { user, logout, isImpersonating, stopImpersonating } = useAuth();

  if (!user) {
    return null;
  }

  const isAdmin = user.role === UserRole.ADMIN;
  const userInitials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 h-16">
      <div className="flex items-center justify-between px-4 h-full">
        <Link
          to="/dashboard"
          className="font-semibold text-xl flex items-center space-x-2"
        >
          <span className="dark:text-white">Aliança</span>
          <span className="text-purple-500">Fiscal</span>
        </Link>

        <div className="flex items-center space-x-4">
          {isImpersonating && (
            <Button
              variant="destructive"
              size="sm"
              onClick={stopImpersonating}
              className="text-xs px-3 py-1 h-auto"
            >
              Voltar à sua conta
            </Button>
          )}

          <NotificationsPopover />

          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="relative h-8 w-8 rounded-full"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.email}
                  </p>
                  {isAdmin && (
                    <Badge variant="outline" className="mt-1 text-xs w-fit">
                      Administrador
                    </Badge>
                  )}
                  {isImpersonating && (
                    <Badge variant="destructive" className="mt-1 text-xs w-fit">
                      Modo visualização
                    </Badge>
                  )}
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  to="/perfil"
                  className="flex w-full items-center cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4" />
                  Meu Perfil
                </Link>
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem asChild>
                  <Link
                    to="/configuracoes"
                    className="flex w-full items-center cursor-pointer"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Configurações
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                {isImpersonating ? "Voltar à sua conta" : "Sair"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
