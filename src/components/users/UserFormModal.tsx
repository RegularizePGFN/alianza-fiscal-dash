
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, UserRole } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
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
        // Update existing user
        console.log("Updating user role to:", formData.role);
        
        // Convert UserRole enum to string for database storage
        const roleString = formData.role === UserRole.ADMIN ? 'admin' : 'vendedor';
        
        console.log(`Updating user ${user.id} with role: ${roleString}`);
        
        // First update the profile directly in the profiles table with timestamp to force update
        const { error: profileUpdateError } = await supabase
          .from('profiles')
          .update({
            name: formData.name,
            email: formData.email,
            role: roleString,
            updated_at: new Date().toISOString() // Force timestamp update
          })
          .eq('id', user.id);
        
        if (profileUpdateError) {
          console.error("Error updating profile:", profileUpdateError);
          throw profileUpdateError;
        }

        console.log("Profile updated successfully with role:", roleString);

        // Also update auth metadata for consistency
        try {
          const { error: authUpdateError } = await supabase.auth.admin.updateUserById(
            user.id,
            { 
              email: formData.email,
              user_metadata: {
                name: formData.name,
                role: roleString
              }
            }
          );
          
          if (authUpdateError) {
            console.warn("Auth metadata update warning (non-critical):", authUpdateError);
          }
        } catch (authError) {
          console.warn("Auth update failed (non-critical):", authError);
        }

        // Update password only if provided
        if (formData.password) {
          try {
            const { error: passwordError } = await supabase.auth.admin.updateUserById(
              user.id,
              { password: formData.password }
            );
            
            if (passwordError) {
              console.error("Error updating password:", passwordError);
              throw passwordError;
            }
          } catch (pwdError) {
            console.error("Password update failed:", pwdError);
            throw pwdError;
          }
        }

        // If we're updating the current user's own profile, refresh the auth context
        try {
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          if (currentUser && currentUser.id === user.id) {
            await refreshUser();
          }
        } catch (authRefreshError) {
          console.warn("Auth refresh failed (non-critical):", authRefreshError);
        }

        // Verify the update was successful by re-fetching the profile
        const { data: verifyData, error: verifyError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
          
        if (verifyError) {
          console.warn("Verification fetch failed:", verifyError);
        } else {
          console.log("Verification: Profile role is now:", verifyData.role);
        }

        toast({
          title: "Usuário atualizado",
          description: `${formData.name} foi atualizado com sucesso.`,
        });
      } else {
        // Create new user
        const roleString = formData.role === UserRole.ADMIN ? 'admin' : 'vendedor';
        
        const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
          email: formData.email,
          password: formData.password,
          email_confirm: true,
          user_metadata: {
            name: formData.name,
            role: roleString
          },
        });

        if (signUpError) {
          throw signUpError;
        }

        toast({
          title: "Usuário criado",
          description: `${formData.name} foi criado com sucesso.`,
        });
      }

      // Wait a moment to ensure database consistency
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Call success callback to trigger data refresh
      onSuccess();
      
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
