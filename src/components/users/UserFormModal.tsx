
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, UserRole } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase, adminAPI } from "@/integrations/supabase/client";
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
      if (user) {
        // Update existing user using secure admin API
        console.log("Updating user role to:", formData.role);
        
        // First update the profile directly in the profiles table
        const { error: profileUpdateError } = await supabase
          .from('profiles')
          .update({
            name: formData.name,
            email: formData.email,
            role: formData.role
          })
          .eq('id', user.id);
        
        if (profileUpdateError) {
          console.error("Error updating profile:", profileUpdateError);
          throw profileUpdateError;
        }

        // Update user metadata through secure admin API
        const updateData: any = { 
          email: formData.email, 
          name: formData.name,
          role: formData.role
        };

        if (formData.password) {
          updateData.password = formData.password;
        }

        const { error: authUpdateError } = await adminAPI.updateUserById(user.id, updateData);
        
        if (authUpdateError) {
          console.error("Error updating auth metadata:", authUpdateError);
          throw new Error(authUpdateError.message);
        }

        // If we're updating the current user's own profile, refresh the auth context
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser && currentUser.id === user.id) {
          await refreshUser();
        }

        toast({
          title: "Usuário atualizado",
          description: `${formData.name} foi atualizado com sucesso.`,
        });
      } else {
        // Create new user using secure admin API
        const { data, error } = await adminAPI.createUser({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: formData.role
        });

        if (error) {
          throw new Error(error.message);
        }

        toast({
          title: "Usuário criado",
          description: `${formData.name} foi criado com sucesso.`,
        });
      }

      // Call these functions only after successful operation
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("User operation error:", error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao processar o usuário.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Modificado para não fechar o dialog quando está carregando
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
