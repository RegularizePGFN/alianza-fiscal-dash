
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

  const handleDialogClose = (open: boolean) => {
    if (!isLoading && !open) {
      onClose();
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    // Validate UUID format on frontend too
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(user.id)) {
      console.error('Invalid UUID format on frontend:', user.id);
      toast({
        title: "Erro",
        description: "ID do usuário em formato inválido.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Attempting to delete user:', user.id);
      
      // Delete user through secure admin API
      const response = await adminAPI.deleteUser(user.id);
      console.log('Delete response:', response);

      if (response.error) {
        console.error('Delete API returned error:', response.error);
        throw new Error(response.error.message);
      }

      toast({
        title: "Usuário excluído",
        description: `${user.name} foi removido do sistema.`,
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      
      let errorMessage = "Ocorreu um erro ao excluir o usuário.";
      
      if (error.message === "Failed to fetch") {
        errorMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
      } else if (error.message?.includes('permissions')) {
        errorMessage = "Você não tem permissão para excluir este usuário.";
      } else if (error.message?.includes('Invalid user ID format')) {
        errorMessage = "ID do usuário em formato inválido.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro ao excluir usuário",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Don't close the modal on error so user can try again
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
