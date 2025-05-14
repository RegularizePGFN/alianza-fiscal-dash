
import { useState } from "react";
import { 
  LayoutDashboard, 
  DollarSign, 
  BarChart3, 
  Settings, 
  Calculator, 
  Users, 
  Menu, 
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { UserRole } from "@/lib/types";
import { Separator } from "@/components/ui/separator";

export function AppSidebar() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  const isAdmin = user?.role === UserRole.ADMIN;

  const toggle = () => setIsOpen(!isOpen);
  const close = () => setIsOpen(false);
  
  const navItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/dashboard",
      showTo: "all"
    },
    {
      title: "Vendas",
      icon: <DollarSign className="h-5 w-5" />,
      href: "/vendas",
      showTo: "all"
    },
    {
      title: "Relatórios",
      icon: <BarChart3 className="h-5 w-5" />,
      href: "/relatorios",
      showTo: isAdmin ? "all" : "none"
    },
    {
      title: "Calculadora",
      icon: <Calculator className="h-5 w-5" />,
      href: "/calculadora",
      showTo: "all"
    },
    {
      title: "Usuários",
      icon: <Users className="h-5 w-5" />,
      href: "/usuarios",
      showTo: isAdmin ? "all" : "none"
    },
    {
      title: "Configurações",
      icon: <Settings className="h-5 w-5" />,
      href: "/configuracoes",
      showTo: "all"
    }
  ];
  
  return (
    <>
      <div className="lg:hidden p-4 flex items-center justify-between border-b">
        <span className="font-bold text-lg">Menu</span>
        <Button variant="outline" size="icon" onClick={toggle}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      
      <div className={cn(
        "fixed inset-0 z-50 bg-background lg:relative lg:flex flex-col p-4 lg:gap-0",
        {"hidden": !isOpen, "flex": isOpen}
      )}>
        <div className="lg:hidden flex justify-between items-center mb-4">
          <span className="font-bold text-lg">Menu</span>
          <Button variant="outline" size="icon" onClick={close}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <Separator />
        
        <nav className="grid items-start mt-4 mb-4 gap-2">
          {navItems
            .filter(item => item.showTo === "all")
            .map((item, index) => (
              <Link 
                key={index}
                to={item.href}
                onClick={close}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-accent transition-colors",
                  pathname === item.href && "bg-accent"
                )}
              >
                {item.icon}
                {item.title}
              </Link>
            ))}
        </nav>
        
        {isOpen && <div className="lg:hidden h-px bg-border my-4" />}
      </div>
    </>
  );
}
