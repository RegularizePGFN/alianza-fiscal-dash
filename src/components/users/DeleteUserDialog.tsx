
import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { User } from "@/lib/types";
import { adminAPI } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface DeleteUserDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteUserDialog({
  user,
  isOpen,
  onClose,
  onSuccess,
}: DeleteUserDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Melhorado para evitar fechamento durante o carregamento
  const handleDialogClose = (open: boolean) => {
    if (!isLoading && !open) {
      onClose();
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Delete user through secure admin API
      const { error } = await adminAPI.deleteUser(user.id);

      if (error) throw new Error(error.message);

      toast({
        title: "Usuário excluído",
        description: `${user.name} foi removido do sistema.`,
      });

      onSuccess();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({
        title: "Erro ao excluir usuário",
        description: error.message || "Ocorreu um erro ao excluir o usuário.",
        variant: "destructive",
      });
      // Importante: fechar o modal mesmo em caso de erro
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleDialogClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Este usuário será permanentemente
            removido do sistema.
            {user && (
              <div className="mt-2 font-medium">
                Nome: {user.name} <br />
                Email: {user.email}
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading}
            onClick={handleDelete}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              "Excluir"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
