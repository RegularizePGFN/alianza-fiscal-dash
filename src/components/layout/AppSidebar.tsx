
import { useAuth } from "@/contexts/auth";
import { cn } from "@/lib/utils";
import { UserRole } from "@/lib/types";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart3, 
  Home, 
  Menu, 
  ShoppingCart, 
  Users, 
  LogOut,
  ChevronLeft,
  Settings,
  FileText,
  User,
  DollarSign,
  Calculator,
  Calendar
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
    <motion.li
      whileHover={{ x: 2 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Link 
        to={to}
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 relative overflow-hidden group",
          expanded ? "justify-start" : "justify-center px-2",
          active 
            ? "bg-gradient-to-r from-sidebar-accent to-sidebar-accent/80 text-sidebar-accent-foreground font-medium shadow-lg shadow-sidebar-accent/20" 
            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
        )}
        onClick={(e) => {
          if (onClick) {
            e.preventDefault();
            onClick(e);
          }
        }}
      >
        <motion.div 
          className={cn(
            "transition-all duration-200 relative z-10", 
            active ? "text-sidebar-accent-foreground" : "text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground"
          )}
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          {icon}
        </motion.div>
        <AnimatePresence>
          {expanded && (
            <motion.div 
              className="relative flex items-center"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
            >
              <span className="truncate">{label}</span>
              {isBeta && (
                <motion.span 
                  className="absolute -top-3 -right-8 text-[9px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-purple-100 to-purple-50 text-purple-800 font-medium border border-purple-200/50"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                >
                  beta
                </motion.span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        {!expanded && isBeta && (
          <motion.span 
            className="absolute top-0.5 right-0.5 text-[8px] px-1 py-0 rounded-full bg-gradient-to-r from-purple-100 to-purple-50 text-purple-800 font-medium"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
          >
            β
          </motion.span>
        )}
        {active && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl"
            layoutId="activeBackground"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
      </Link>
    </motion.li>
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
  
  // Check if user has access to financial section
  const hasFinanceAccess = user?.email === 'felipe.souza@socialcriativo.com';
  
  return (
    <motion.div 
      className={cn(
        "bg-gradient-to-b from-sidebar to-sidebar/95 relative h-screen flex flex-col shadow-xl border-r border-sidebar-border/30 backdrop-blur-sm",
        expanded ? "w-60" : "w-16"
      )}
      animate={{ width: expanded ? 240 : 64 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <motion.div 
        className="flex items-center justify-between p-4 border-b border-sidebar-border/30 bg-gradient-to-r from-sidebar-accent/20 to-sidebar-accent/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <AnimatePresence>
          {expanded && (
            <motion.h1 
              className="text-sidebar-foreground font-bold text-xl overflow-hidden truncate"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              Aliança<span className="text-primary">Fiscal</span>
            </motion.h1>
          )}
        </AnimatePresence>
        <motion.button 
          onClick={toggleSidebar}
          className="p-2 rounded-xl hover:bg-sidebar-accent text-sidebar-foreground transition-colors duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{ rotate: expanded ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            {expanded ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </motion.div>
        </motion.button>
      </motion.div>
      
      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-2 bg-gradient-to-b from-sidebar-accent/5 to-transparent">
        <motion.ul 
          className="space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
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
          
          <SidebarLink 
            to="/agendamentos" 
            icon={<Calendar size={20} />} 
            label="Agendamentos" 
            expanded={expanded}
            active={location.pathname === "/agendamentos"}
            isBeta={true}
          />
          
          {/* Financial section - only for specific user */}
          {hasFinanceAccess && (
            <SidebarLink 
              to="/financeiro" 
              icon={<Calculator size={20} />} 
              label="Financeiro" 
              expanded={expanded}
              active={location.pathname === "/financeiro"}
            />
          )}
          
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
                to="/comissoes" 
                icon={<DollarSign size={20} />} 
                label="Comissões" 
                expanded={expanded}
                active={location.pathname === "/comissoes"}
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
            icon={<User size={20} />} 
            label="Perfil" 
            expanded={expanded}
            active={location.pathname === "/perfil"}
          />
        </motion.ul>
      </nav>
      
      <motion.div 
        className="mt-auto border-t border-sidebar-border/30 p-3 bg-gradient-to-r from-sidebar-accent/10 to-sidebar-accent/5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <ul className="space-y-1">
          <SidebarLink 
            to="#" 
            icon={<LogOut size={20} />} 
            label="Sair" 
            expanded={expanded} 
            onClick={handleLogout}
          />
        </ul>
      </motion.div>
    </motion.div>
  );
}
