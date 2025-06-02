
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, UserRole } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminAPI } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User;
  onSuccess: () => void;
}

export function UserFormModal({
  user,
  isOpen,
  onClose,
  onSuccess,
}: UserFormModalProps) {
  const { toast } = useToast();
  const { refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: UserRole.SALESPERSON,
  });

  // Load user data if editing
  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        name: user.name,
        email: user.email,
        password: "",
        role: user.role,
      });
    } else if (isOpen) {
      // Reset form for new user
      setFormData({
        name: "",
        email: "",
        password: "",
        role: UserRole.SALESPERSON,
      });
    }
  }, [user, isOpen]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.name.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "O nome do usuário é obrigatório",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.email.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "O email do usuário é obrigatório",
        variant: "destructive",
      });
      return;
    }
    
    if (!user && !formData.password) {
      toast({
        title: "Campo obrigatório",
        description: "A senha é obrigatória para novos usuários",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);

    try {
      console.log('Starting user operation:', { 
        isEdit: !!user, 
        userId: user?.id,
        formData: { ...formData, password: formData.password ? '[HIDDEN]' : '' }
      });

      if (user) {
        // Update existing user
        console.log("Updating user through Edge Function:", user.id);
        
        const updateData: any = { 
          email: formData.email, 
          name: formData.name,
          role: formData.role
        };

        if (formData.password && formData.password.trim()) {
          updateData.password = formData.password;
        }

        console.log('Calling adminAPI.updateUserById with:', { ...updateData, password: updateData.password ? '[HIDDEN]' : 'not provided' });
        
        const response = await adminAPI.updateUserById(user.id, updateData);
        
        console.log('Edge Function response:', response);
        
        if (response.error) {
          console.error("Edge Function returned error:", response.error);
          throw new Error(response.error.message || 'Erro ao atualizar usuário');
        }

        // If we're updating the current user's own profile, refresh the auth context
        const currentUser = await fetch('/api/current-user').catch(() => null);
        if (currentUser && user.id === currentUser.id) {
          await refreshUser();
        }

        toast({
          title: "Usuário atualizado",
          description: `${formData.name} foi atualizado com sucesso.`,
        });
      } else {
        // Create new user using Edge Function
        console.log("Creating new user through Edge Function");
        
        const createData = {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: formData.role
        };

        console.log('Calling adminAPI.createUser with:', { ...createData, password: '[HIDDEN]' });
        
        const response = await adminAPI.createUser(createData);
        
        console.log('Edge Function response:', response);

        if (response.error) {
          console.error("Edge Function returned error:", response.error);
          throw new Error(response.error.message || 'Erro ao criar usuário');
        }

        toast({
          title: "Usuário criado",
          description: `${formData.name} foi criado com sucesso.`,
        });
      }

      // Call success callbacks
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("User operation failed:", error);
      
      // Show user-friendly error message
      let errorMessage = "Ocorreu um erro ao processar o usuário.";
      
      if (error.message) {
        if (error.message.includes('already exists')) {
          errorMessage = 'Este e-mail já está cadastrado no sistema.';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
        } else if (error.message.includes('permissions')) {
          errorMessage = 'Você não tem permissão para realizar esta operação.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && !isLoading) {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{user ? "Editar Usuário" : "Adicionar Usuário"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">
                {user ? "Nova Senha (deixe em branco para manter)" : "Senha"}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                required={!user}
                minLength={6}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Função</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleChange("role", value)}
                disabled={isLoading}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Selecione uma função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.ADMIN}>Administrador</SelectItem>
                  <SelectItem value={UserRole.SALESPERSON}>Vendedor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (!isLoading) {
                  onClose();
                }
              }}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {user ? "Atualizando..." : "Criando..."}
                </>
              ) : (
                user ? "Atualizar" : "Criar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
