
import { User, ArrowLeft, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NotificationsPopover } from "@/components/notifications/NotificationsPopover";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function AppHeader() {
  const { user, isImpersonating, stopImpersonating } = useAuth();
  const { toast } = useToast();
  const [isReturningToOriginal, setIsReturningToOriginal] = useState(false);
  
  const handleReturnToOriginalUser = async () => {
    setIsReturningToOriginal(true);
    try {
      const success = await stopImpersonating();
      if (success) {
        toast({
          title: "Sucesso",
          description: "Você retornou à sua conta original",
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível retornar à sua conta original",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao retornar à sua conta",
        variant: "destructive",
      });
    } finally {
      setIsReturningToOriginal(false);
    }
  };
  
  return (
    <motion.header 
      className="sticky top-0 z-50 h-16 flex items-center gap-4 border-b bg-gradient-to-r from-header to-header/95 backdrop-blur-sm px-4 md:px-6 dark:border-gray-800 dark:from-gray-900/90 dark:to-gray-900/80 app-header shadow-sm"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* User greeting aligned to the left */}
      <motion.div 
        className="flex-1"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {user && (
          <span className="font-medium text-foreground">
            Olá {user.name || user.email?.split('@')[0] || ''}
          </span>
        )}
      </motion.div>
      
      <motion.div 
        className="flex items-center gap-3"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {isImpersonating && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              variant="outline" 
              onClick={handleReturnToOriginalUser}
              disabled={isReturningToOriginal}
              size="sm"
              className="text-xs border-border/40 hover:border-border bg-background/50 backdrop-blur-sm"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              Voltar à sua conta
            </Button>
          </motion.div>
        )}
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ThemeToggle />
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <NotificationsPopover />
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link 
            to="/perfil" 
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 hover:from-muted hover:to-muted/70 border border-border/40 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <span className="sr-only">Perfil</span>
            <User className="h-4 w-4" />
          </Link>
        </motion.div>
      </motion.div>
    </motion.header>
  );
}
