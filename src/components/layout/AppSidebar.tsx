
import { useAuth } from "@/contexts/auth";
import { cn } from "@/lib/utils";
import { UserRole } from "@/lib/types";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  BarChart3, 
  Home, 
  Menu, 
  ShoppingCart, 
  Users, 
  LogOut,
  ChevronLeft,
  Settings,
  X
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  expanded: boolean;
  active?: boolean;
  onClick?: () => void;
}

const SidebarLink = ({ to, icon, label, expanded, active, onClick }: SidebarLinkProps) => {
  return (
    <li>
      <Link 
        to={to}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200",
          expanded ? "justify-start" : "justify-center px-2",
          active 
            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm" 
            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
        )}
        onClick={onClick}
      >
        <div className={cn("transition-all duration-200", active ? "text-sidebar-accent-foreground" : "text-sidebar-foreground/70")}>
          {icon}
        </div>
        {expanded && <span className="truncate">{label}</span>}
      </Link>
    </li>
  );
};

interface AppSidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function AppSidebar({ isMobileOpen = false, onCloseMobile }: AppSidebarProps) {
  const { user, logout } = useAuth();
  const [expanded, setExpanded] = useState(true);
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const toggleSidebar = () => {
    if (!isMobile) {
      setExpanded(!expanded);
    }
  };
  
  // Fecha a sidebar em transições de rota em dispositivos móveis
  useEffect(() => {
    if (isMobile && onCloseMobile) {
      onCloseMobile();
    }
  }, [location.pathname, isMobile, onCloseMobile]);
  
  // Check if user has admin privileges
  const isAdmin = user?.role === UserRole.ADMIN;

  // Overlay para dispositivos móveis
  const mobileOverlayClass = isMobile && isMobileOpen
    ? "fixed inset-0 bg-black/50 z-40" 
    : "hidden";
  
  return (
    <>
      {/* Overlay para dispositivos móveis */}
      {isMobile && (
        <div className={mobileOverlayClass} onClick={onCloseMobile} />
      )}
      
      <div className={cn(
        "bg-sidebar h-screen transition-all duration-300 flex flex-col",
        isMobile 
          ? "fixed z-50 shadow-xl" 
          : "relative",
        expanded && !isMobile 
          ? "w-60" 
          : !isMobile ? "w-16" : "",
        isMobile 
          ? isMobileOpen 
            ? "left-0 w-72" 
            : "-left-80 w-72" 
          : ""
      )}>
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border/30">
          {(expanded || isMobile) && (
            <h1 className="text-sidebar-foreground font-bold text-xl overflow-hidden truncate">
              Aliança<span className="text-af-green-400">Fiscal</span>
            </h1>
          )}
          
          {isMobile ? (
            <button 
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground transition-colors duration-200"
            >
              <X size={20} />
            </button>
          ) : (
            <button 
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground transition-colors duration-200"
            >
              {expanded ? <ChevronLeft size={20} /> : <Menu size={20} />}
            </button>
          )}
        </div>
        
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-2">
          <ul className="space-y-1">
            <SidebarLink 
              to="/dashboard" 
              icon={<Home size={20} />} 
              label="Dashboard" 
              expanded={expanded || isMobile}
              active={location.pathname === "/dashboard"}
              onClick={isMobile ? onCloseMobile : undefined}
            />
            
            <SidebarLink 
              to="/vendas" 
              icon={<ShoppingCart size={20} />} 
              label="Vendas" 
              expanded={expanded || isMobile}
              active={location.pathname === "/vendas"}
              onClick={isMobile ? onCloseMobile : undefined}
            />
            
            {/* Admin links */}
            {isAdmin && (
              <>
                <SidebarLink 
                  to="/usuarios" 
                  icon={<Users size={20} />} 
                  label="Usuários" 
                  expanded={expanded || isMobile}
                  active={location.pathname === "/usuarios"}
                  onClick={isMobile ? onCloseMobile : undefined}
                />
                <SidebarLink 
                  to="/relatorios" 
                  icon={<BarChart3 size={20} />} 
                  label="Relatórios" 
                  expanded={expanded || isMobile}
                  active={location.pathname === "/relatorios"}
                  onClick={isMobile ? onCloseMobile : undefined}
                />
                <SidebarLink 
                  to="/configuracoes" 
                  icon={<Settings size={20} />} 
                  label="Configurações" 
                  expanded={expanded || isMobile}
                  active={location.pathname === "/configuracoes"}
                  onClick={isMobile ? onCloseMobile : undefined}
                />
              </>
            )}
          </ul>
        </nav>
        
        <div className="mt-auto border-t border-sidebar-border/30 p-2">
          <ul className="space-y-1">
            <SidebarLink 
              to="#" 
              icon={<LogOut size={20} />} 
              label="Sair" 
              expanded={expanded || isMobile}
              onClick={() => {
                if (isMobile && onCloseMobile) onCloseMobile();
                logout();
              }}
            />
          </ul>
        </div>
      </div>
    </>
  );
}
