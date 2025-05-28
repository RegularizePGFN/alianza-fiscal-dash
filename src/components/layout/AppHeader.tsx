
import { User, ArrowLeft, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NotificationsPopover } from "@/components/notifications/NotificationsPopover";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

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
      className="sticky top-0 z-50 h-16 flex items-center gap-4 border-b bg-white/80 backdrop-blur-md px-4 md:px-6 dark:border-gray-800 dark:bg-gray-900/80 dark:backdrop-blur-md app-header shadow-sm"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* User greeting aligned to the left */}
      <div className="flex-1">
        {user && (
          <motion.span 
            className="font-medium text-gray-700 dark:text-gray-200"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            Olá, <span className="text-primary font-semibold">{user.name || user.email?.split('@')[0] || ''}</span>
          </motion.span>
        )}
      </div>
      
      <motion.div 
        className="flex items-center gap-3"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        {isImpersonating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Button 
              variant="outline" 
              onClick={handleReturnToOriginalUser}
              disabled={isReturningToOriginal}
              size="sm"
              className="text-xs gap-2 border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-900/20"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Voltar à sua conta
            </Button>
          </motion.div>
        )}
        
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <ThemeToggle />
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <NotificationsPopover />
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link 
            to="/perfil" 
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 dark:from-gray-800 dark:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200"
          >
            <span className="sr-only">Perfil</span>
            <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </Link>
        </motion.div>
      </motion.div>
    </motion.header>
  );
}
