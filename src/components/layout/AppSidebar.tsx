
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth";
import { UserRole } from "@/lib/types";
import { BarChart3, Calculator, Home, Settings, ShoppingBag, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppSidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function AppSidebar({ isMobileOpen = false, onMobileClose }: AppSidebarProps) {
  const location = useLocation();
  const { user } = useAuth();
  
  const isAdmin = user?.role === UserRole.ADMIN;
  
  const sidebarClasses = cn(
    "bg-sidebar h-screen w-64 border-r border-sidebar-border flex-shrink-0 flex flex-col z-40 transition-transform duration-300",
    "fixed inset-y-0 left-0 md:relative",
    isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
  );
  
  const overlayClasses = cn(
    "fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity",
    isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
  );

  const links = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: <Home size={20} />,
      show: true,
    },
    {
      to: "/sales",
      label: "Vendas",
      icon: <ShoppingBag size={20} />,
      show: true,
    },
    {
      to: "/calculator",
      label: "Calculadora",
      icon: <Calculator size={20} />,
      show: true,
    },
    {
      to: "/reports",
      label: "Relatórios",
      icon: <BarChart3 size={20} />,
      show: isAdmin,
    },
    {
      to: "/users",
      label: "Usuários",
      icon: <Users size={20} />,
      show: isAdmin,
    },
    {
      to: "/settings",
      label: "Configurações",
      icon: <Settings size={20} />,
      show: true,
    },
  ];

  return (
    <>
      {/* Overlay para fechar em dispositivos móveis */}
      <div className={overlayClasses} onClick={onMobileClose} />
      
      <aside className={sidebarClasses}>
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <h1 className="text-xl font-bold text-sidebar-foreground">Aliança Fiscal</h1>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onMobileClose} 
            className="md:hidden text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <X size={20} />
            <span className="sr-only">Fechar menu</span>
          </Button>
        </div>
        
        <nav className="p-2 flex-1 overflow-y-auto">
          <ul className="space-y-1">
            {links
              .filter(link => link.show)
              .map(link => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    onClick={() => isMobileOpen && onMobileClose?.()}
                    className={({ isActive }) => cn(
                      "flex items-center px-3 py-2 rounded-md text-sidebar-foreground gap-3 transition-colors",
                      isActive 
                        ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                        : "hover:bg-sidebar-accent/70"
                    )}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </NavLink>
                </li>
              ))}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-sidebar-border">
          <div className="text-sm text-sidebar-foreground/80">
            {user?.role === UserRole.ADMIN ? "Administrador" : "Vendedor"}
            <div className="text-xs opacity-70 mt-1">
              {user?.email}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
