
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { NotificationsPopover } from "@/components/notifications/NotificationsPopover";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Menu, Search } from "lucide-react";
import { useState } from "react";
import { SearchDialog } from "@/components/search/SearchDialog";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface AppHeaderProps {
  onMobileMenuToggle?: () => void;
}

export function AppHeader({ onMobileMenuToggle }: AppHeaderProps) {
  const { user, signOut } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  
  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur px-4 md:px-6 gap-4">
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={onMobileMenuToggle} className="mr-2">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menu</span>
          </Button>
        </div>
        
        <div className="hidden md:block">
          {/* Placeholder para título ou breadcrumbs */}
        </div>
        
        <div className="flex flex-1 items-center justify-end space-x-2 sm:space-x-4">
          <div className="flex items-center gap-1 sm:gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="h-9 w-9 border-dashed"
                    onClick={() => setSearchOpen(true)}
                  >
                    <Search className="h-4 w-4" />
                    <span className="sr-only">Buscar</span>
                    <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                      <span className="text-xs">⌘</span>K
                    </kbd>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Busca rápida <kbd className="ml-1">⌘K</kbd></p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <ThemeToggle />
            <NotificationsPopover />
            
            <div className="ml-1 sm:ml-2 flex items-center">
              <span className="hidden md:inline text-sm mr-2 truncate max-w-[150px]">
                {user?.name || user?.email}
              </span>
              <Button variant="ghost" size="sm" onClick={signOut} className="text-xs sm:text-sm whitespace-nowrap">
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
