
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";

// Form schema for password change
const passwordChangeSchema = z.object({
  currentPassword: z.string().min(6, "A senha atual deve ter pelo menos 6 caracteres"),
  newPassword: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string().min(6, "A confirmação de senha deve ter pelo menos 6 caracteres")
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

// Form schema for profile update
const profileUpdateSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
});

type PasswordChangeForm = z.infer<typeof passwordChangeSchema>;
type ProfileUpdateForm = z.infer<typeof profileUpdateSchema>;

const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  // Password change form
  const passwordForm = useForm<PasswordChangeForm>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Profile update form
  const profileForm = useForm<ProfileUpdateForm>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: user?.name || "",
    },
  });

  // Update profile form when user changes
  useState(() => {
    if (user) {
      profileForm.reset({
        name: user.name || "",
      });
    }
  });

  const onSubmitPassword = async (data: PasswordChangeForm) => {
    if (!user) return;

    setIsLoading(true);
    try {
      // First sign in with current password to verify it
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: data.currentPassword,
      });

      if (signInError) {
        toast({
          title: "Erro",
          description: "Senha atual incorreta",
          variant: "destructive",
        });
        return;
      }

      // Then update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (updateError) {
        toast({
          title: "Erro",
          description: updateError.message || "Erro ao atualizar a senha",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Senha atualizada",
        description: "Sua senha foi atualizada com sucesso",
      });

      // Reset the form
      passwordForm.reset();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao atualizar a senha",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitProfile = async (data: ProfileUpdateForm) => {
    if (!user) return;

    setIsProfileLoading(true);
    try {
      // Update the profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ name: data.name })
        .eq('id', user.id);

      if (error) {
        toast({
          title: "Erro",
          description: error.message || "Erro ao atualizar o perfil",
          variant: "destructive",
        });
        return;
      }

      // Update local user state through auth context (this will happen automatically through onAuthStateChange)
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao atualizar o perfil",
        variant: "destructive",
      });
    } finally {
      setIsProfileLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="container max-w-4xl mx-auto py-10">
        <h1 className="text-2xl font-bold mb-8">Perfil do Usuário</h1>

        <div className="grid gap-8">
          {/* User Info Card */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Informações do Usuário</CardTitle>
              <CardDescription>
                Atualize seus dados pessoais
              </CardDescription>
            </CardHeader>
            
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onSubmitProfile)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-1">
                      Email
                    </label>
                    <Input 
                      value={user?.email || ""} 
                      disabled 
                      className="bg-muted/50"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-1">
                      Função
                    </label>
                    <Input 
                      value={user?.role === "admin" ? "Administrador" : "Especialista Tributário"} 
                      disabled 
                      className="bg-muted/50"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-1">
                      Desde
                    </label>
                    <Input 
                      value={user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : ""}
                      disabled 
                      className="bg-muted/50"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isProfileLoading}>
                    {isProfileLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      "Salvar Alterações"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>

          {/* Change Password Card */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Alterar Senha</CardTitle>
              <CardDescription>
                Informe sua senha atual e a nova senha desejada
              </CardDescription>
            </CardHeader>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha Atual</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Digite sua senha atual" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nova Senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Digite sua nova senha" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar Nova Senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Confirme sua nova senha" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Atualizando...
                      </>
                    ) : (
                      "Alterar Senha"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
