
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { UserRole } from "@/lib/types";
import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  BarChart3, 
  Home, 
  Menu, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut 
} from "lucide-react";

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  expanded: boolean;
  onClick?: () => void;
}

const SidebarLink = ({ to, icon, label, expanded, onClick }: SidebarLinkProps) => {
  return (
    <li>
      <Link 
        to={to}
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-sidebar-foreground hover:bg-sidebar-accent transition-all", 
          !expanded && "justify-center px-2"
        )}
        onClick={onClick}
      >
        <div className="text-sidebar-foreground">{icon}</div>
        {expanded && <span>{label}</span>}
      </Link>
    </li>
  );
};

export function AppSidebar() {
  const { user, logout } = useAuth();
  const [expanded, setExpanded] = useState(true);
  
  const toggleSidebar = () => setExpanded(!expanded);
  
  return (
    <div className={cn(
      "bg-sidebar h-screen transition-all duration-300 p-3 flex flex-col",
      expanded ? "w-60" : "w-16"
    )}>
      <div className="flex items-center justify-between mb-6">
        {expanded && (
          <h1 className="text-sidebar-foreground font-bold text-xl">
            Aliança<span className="text-af-green-400">Fiscal</span>
          </h1>
        )}
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground"
        >
          <Menu size={20} />
        </button>
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-1">
          <SidebarLink 
            to="/dashboard" 
            icon={<Home size={20} />} 
            label="Dashboard" 
            expanded={expanded} 
          />
          
          <SidebarLink 
            to="/vendas" 
            icon={<ShoppingCart size={20} />} 
            label="Vendas" 
            expanded={expanded} 
          />
          
          {/* Admin and Manager only links */}
          {user && ['admin', 'gestor'].includes(user.role) && (
            <SidebarLink 
              to="/usuarios" 
              icon={<Users size={20} />} 
              label="Usuários" 
              expanded={expanded} 
            />
          )}
          
          {/* Admin only links */}
          {user && user.role === UserRole.ADMIN && (
            <SidebarLink 
              to="/configuracoes" 
              icon={<Settings size={20} />} 
              label="Configurações" 
              expanded={expanded} 
            />
          )}
        </ul>
      </nav>
      
      <div className="mt-auto">
        <ul className="space-y-1">
          <SidebarLink 
            to="#" 
            icon={<LogOut size={20} />} 
            label="Sair" 
            expanded={expanded} 
            onClick={logout}
          />
        </ul>
      </div>
    </div>
  );
}
