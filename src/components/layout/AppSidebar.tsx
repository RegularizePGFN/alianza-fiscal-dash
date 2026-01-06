import { useAuth } from "@/contexts/auth";
import { cn } from "@/lib/utils";
import { UserRole } from "@/lib/types";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BarChart3, Home, Menu, ShoppingCart, Users, LogOut, ChevronLeft, Settings, FileText, User, DollarSign, History, Calculator, Calendar, TrendingUp, UserCog, Monitor } from "lucide-react";
interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  expanded: boolean;
  active?: boolean;
  isBeta?: boolean;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}
const SidebarLink = ({
  to,
  icon,
  label,
  expanded,
  active,
  isBeta,
  onClick
}: SidebarLinkProps) => {
  return <li>
      <Link to={to} className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 relative group", expanded ? "justify-start" : "justify-center px-2", active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground")} onClick={e => {
      if (onClick) {
        e.preventDefault();
        onClick(e);
      }
    }}>
        {/* Active indicator bar */}
        {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />}
        
        <span className={cn("flex-shrink-0 transition-colors duration-200", active ? "text-primary" : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground")}>
          {icon}
        </span>
        
        {expanded && <div className="relative flex items-center min-w-0">
            <span className={cn("truncate text-sm", active && "font-medium")}>{label}</span>
            {isBeta && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                beta
              </span>}
          </div>}
        
        {!expanded && isBeta && <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary" />}
      </Link>
    </li>;
};
interface SidebarGroupProps {
  title: string;
  children: React.ReactNode;
  expanded: boolean;
}
const SidebarGroup = ({
  title,
  children,
  expanded
}: SidebarGroupProps) => {
  return <div className="space-y-1">
      {expanded && <div className="px-3 py-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
            {title}
          </span>
        </div>}
      <ul className="space-y-0.5">{children}</ul>
    </div>;
};
export function AppSidebar() {
  const {
    user,
    logout
  } = useAuth();
  const [expanded, setExpanded] = useState(true);
  const location = useLocation();
  const toggleSidebar = () => setExpanded(!expanded);
  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
  };
  const isAdmin = user?.role === UserRole.ADMIN;
  const isSalesperson = user?.role === UserRole.SALESPERSON;
  const hasFinanceAccess = user?.email === 'felipe.souza@socialcriativo.com';
  return <div className={cn("bg-sidebar h-screen flex flex-col border-r border-sidebar-border transition-all duration-200", expanded ? "w-60" : "w-16")}>
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        {expanded && <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Monitor className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sidebar-foreground">
              Aliança<span className="text-primary">Fiscal</span>
            </span>
          </div>}
        
        <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
          {expanded ? <ChevronLeft size={18} /> : <Menu size={18} />}
        </button>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {/* Comercial Group */}
        <SidebarGroup title="Comercial" expanded={expanded}>
          <SidebarLink to="/dashboard" icon={<Home size={18} />} label="Dashboard" expanded={expanded} active={location.pathname === "/dashboard"} />
          <SidebarLink to="/vendas" icon={<ShoppingCart size={18} />} label="Vendas" expanded={expanded} active={location.pathname === "/vendas"} />
          <SidebarLink to="/propostas" icon={<FileText size={18} />} label="Propostas" expanded={expanded} active={location.pathname === "/propostas"} isBeta={true} />
          <SidebarLink to="/agendamentos" icon={<Calendar size={18} />} label="Agendamentos" expanded={expanded} active={location.pathname === "/agendamentos"} isBeta={true} />
          {isSalesperson && <SidebarLink to="/meu-historico" icon={<History size={18} />} label="Meu Histórico" expanded={expanded} active={location.pathname === "/meu-historico"} />}
        </SidebarGroup>
        
        {/* Administrativo Group - Only for admins */}
        {isAdmin && <SidebarGroup title="Administrativo" expanded={expanded}>
            <SidebarLink to="/usuarios" icon={<Users size={18} />} label="Usuários" expanded={expanded} active={location.pathname === "/usuarios"} />
            <SidebarLink to="/relatorios" icon={<BarChart3 size={18} />} label="Relatórios" expanded={expanded} active={location.pathname === "/relatorios"} />
            <SidebarLink to="/comissoes" icon={<DollarSign size={18} />} label="Comissões" expanded={expanded} active={location.pathname === "/comissoes"} />
            {hasFinanceAccess && <SidebarLink to="/financeiro" icon={<Calculator size={18} />} label="Financeiro" expanded={expanded} active={location.pathname === "/financeiro"} />}
            <SidebarLink to="/configuracoes" icon={<Settings size={18} />} label="Configurações" expanded={expanded} active={location.pathname === "/configuracoes"} />
          </SidebarGroup>}
        
        {/* Finance for non-admin with access */}
        {!isAdmin && hasFinanceAccess && <SidebarGroup title="Financeiro" expanded={expanded}>
            <SidebarLink to="/financeiro" icon={<Calculator size={18} />} label="Financeiro" expanded={expanded} active={location.pathname === "/financeiro"} />
          </SidebarGroup>}
      </nav>
      
      {/* Footer */}
      <div className="border-t border-sidebar-border p-2 space-y-0.5">
        <SidebarLink to="/perfil" icon={<User size={18} />} label="Perfil" expanded={expanded} active={location.pathname === "/perfil"} />
        <SidebarLink to="#" icon={<LogOut size={18} />} label="Sair" expanded={expanded} onClick={handleLogout} />
      </div>
    </div>;
}