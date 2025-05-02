
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, UserRole } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User;
  onSuccess: () => void;
}

export function UserFormModal({ isOpen, onClose, user, onSuccess }: UserFormModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: UserRole.SALESPERSON,
  });

  // Load user data if editing
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: "", // We don't pre-fill password
        role: user.role,
      });
    } else {
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
    setIsLoading(true);

    try {
      if (user) {
        // Update existing user
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            name: formData.name,
            role: formData.role,
          })
          .eq("id", user.id);

        if (updateError) throw updateError;

        // Update email if changed (requires auth API)
        if (formData.email !== user.email) {
          const { error: authUpdateError } = await supabase.auth.admin.updateUserById(
            user.id,
            { email: formData.email }
          );
          
          if (authUpdateError) throw authUpdateError;
        }

        // Update password if provided
        if (formData.password) {
          const { error: passwordError } = await supabase.auth.admin.updateUserById(
            user.id,
            { password: formData.password }
          );
          
          if (passwordError) throw passwordError;
        }

        toast({
          title: "Usuário atualizado",
          description: `${formData.name} foi atualizado com sucesso.`,
        });
      } else {
        // Create new user
        const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
          email: formData.email,
          password: formData.password,
          email_confirm: true,
          user_metadata: {
            name: formData.name,
          },
        });

        if (signUpError) {
          console.error("Error creating user:", signUpError);
          
          // Show specific error message
          toast({
            title: "Erro ao criar usuário",
            description: signUpError.message || "Ocorreu um erro ao criar o usuário.",
            variant: "destructive",
          });
          
          setIsLoading(false);
          return;
        }

        // Update role (profile should be created via trigger)
        if (signUpData.user) {
          const { error: roleError } = await supabase
            .from("profiles")
            .update({ role: formData.role })
            .eq("id", signUpData.user.id);

          if (roleError) throw roleError;
        }

        toast({
          title: "Usuário criado",
          description: `${formData.name} foi criado com sucesso.`,
        });
      }

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{user ? "Editar Usuário" : "Adicionar Usuário"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
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
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Função</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleChange("role", value)}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Selecione uma função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.ADMIN}>Administrador</SelectItem>
                  <SelectItem value={UserRole.MANAGER}>Gestor</SelectItem>
                  <SelectItem value={UserRole.SALESPERSON}>Vendedor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Processando..." : user ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
