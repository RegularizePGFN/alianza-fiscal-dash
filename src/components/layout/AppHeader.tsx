
import { useAuth } from "@/contexts/auth";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NotificationsPopover } from "@/components/notifications/NotificationsPopover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/lib/types";

export function AppHeader() {
  const { user, signOut } = useAuth();
  
  if (!user) return null;
  
  const isAdmin = user.role === UserRole.ADMIN;
  
  // Função para determinar a saudação com base na hora do dia
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };
  
  // Nome do usuário formatado
  const userName = user.name?.split(" ")[0] || user.email?.split("@")[0] || "Usuário";

  return (
    <header className="border-b bg-background h-14 flex items-center px-4 md:px-6">
      <div className="flex-1">
        <h2 className="text-sm font-medium">
          {getGreeting()}, {userName}
        </h2>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <NotificationsPopover />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar>
                <AvatarImage src="" />
                <AvatarFallback className={isAdmin ? "bg-amber-100" : "bg-blue-100"}>
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
