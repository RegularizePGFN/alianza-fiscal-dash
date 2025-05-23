
import { useAuth } from "@/contexts/auth";
import { cn } from "@/lib/utils";
import { UserRole } from "@/lib/types";
import { useState } from "react";
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
  FileText
} from "lucide-react";

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  expanded: boolean;
  active?: boolean;
  isBeta?: boolean;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

const SidebarLink = ({ to, icon, label, expanded, active, isBeta, onClick }: SidebarLinkProps) => {
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
        onClick={(e) => {
          if (onClick) {
            e.preventDefault();
            onClick(e);
          }
        }}
      >
        <div className={cn("transition-all duration-200", active ? "text-sidebar-accent-foreground" : "text-sidebar-foreground/70")}>
          {icon}
        </div>
        {expanded && (
          <div className="relative flex items-center">
            <span className="truncate">{label}</span>
            {isBeta && (
              <span className="absolute -top-3 -right-8 text-[9px] px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-medium">
                beta
              </span>
            )}
          </div>
        )}
        {!expanded && isBeta && (
          <span className="absolute top-0.5 right-0.5 text-[8px] px-1 py-0 rounded-full bg-purple-100 text-purple-800 font-medium">
            β
          </span>
        )}
      </Link>
    </li>
  );
};

export function AppSidebar() {
  const { user, logout } = useAuth();
  const [expanded, setExpanded] = useState(true);
  const location = useLocation();
  
  const toggleSidebar = () => setExpanded(!expanded);
  
  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
  };
  
  // Check if user has admin privileges
  const isAdmin = user?.role === UserRole.ADMIN;
  
  return (
    <div className={cn(
      "bg-sidebar relative h-screen transition-all duration-300 flex flex-col shadow-lg border-r border-sidebar-border",
      expanded ? "w-60" : "w-16"
    )}>
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border/30 bg-sidebar-accent/30">
        {expanded && (
          <h1 className="text-sidebar-foreground font-bold text-xl overflow-hidden truncate">
            Aliança<span className="text-af-green-400">Fiscal</span>
          </h1>
        )}
        <button 
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground transition-colors duration-200"
        >
          {expanded ? <ChevronLeft size={20} /> : <Menu size={20} />}
        </button>
      </div>
      
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-2 bg-gradient-to-b from-sidebar-accent/10 to-sidebar">
        <ul className="space-y-1">
          <SidebarLink 
            to="/dashboard" 
            icon={<Home size={20} />} 
            label="Dashboard" 
            expanded={expanded}
            active={location.pathname === "/dashboard"}
          />
          
          <SidebarLink 
            to="/vendas" 
            icon={<ShoppingCart size={20} />} 
            label="Vendas" 
            expanded={expanded}
            active={location.pathname === "/vendas"}
          />
          
          <SidebarLink 
            to="/propostas" 
            icon={<FileText size={20} />} 
            label="Propostas" 
            expanded={expanded}
            active={location.pathname === "/propostas"}
            isBeta={true}
          />
          
          {/* Admin links */}
          {isAdmin && (
            <>
              <SidebarLink 
                to="/usuarios" 
                icon={<Users size={20} />} 
                label="Usuários" 
                expanded={expanded}
                active={location.pathname === "/usuarios"}
              />
              <SidebarLink 
                to="/relatorios" 
                icon={<BarChart3 size={20} />} 
                label="Relatórios" 
                expanded={expanded}
                active={location.pathname === "/relatorios"}
              />
              <SidebarLink 
                to="/configuracoes" 
                icon={<Settings size={20} />} 
                label="Configurações" 
                expanded={expanded}
                active={location.pathname === "/configuracoes"}
              />
            </>
          )}
          
          <SidebarLink 
            to="/perfil" 
            icon={<Users size={20} />} 
            label="Perfil" 
            expanded={expanded}
            active={location.pathname === "/perfil"}
          />
        </ul>
      </nav>
      
      <div className="mt-auto border-t border-sidebar-border/30 p-2 bg-sidebar-accent/20">
        <ul className="space-y-1">
          <SidebarLink 
            to="#" 
            icon={<LogOut size={20} />} 
            label="Sair" 
            expanded={expanded} 
            onClick={handleLogout}
          />
        </ul>
      </div>
    </div>
  );
}
