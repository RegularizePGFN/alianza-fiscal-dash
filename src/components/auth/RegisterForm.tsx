
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onSuccessfulRegister: (email: string, password: string) => void;
}

export function RegisterForm({ onSwitchToLogin, onSuccessfulRegister }: RegisterFormProps) {
  const { toast } = useToast();
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setRegisterError('');

    try {
      // Validation
      if (!registerEmail || !registerPassword || !registerName) {
        setRegisterError('Todos os campos são obrigatórios');
        setIsLoading(false);
        return;
      }

      if (registerPassword.length < 6) {
        setRegisterError('A senha deve ter pelo menos 6 caracteres');
        setIsLoading(false);
        return;
      }

      // Register with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: registerEmail,
        password: registerPassword,
        options: {
          data: {
            name: registerName,
          }
        }
      });

      if (error) {
        console.error('Registration error:', error);
        setRegisterError(error.message || 'Erro ao registrar usuário');
        return;
      }

      toast({
        title: "Cadastro realizado",
        description: "Sua conta foi criada com sucesso. Você já pode fazer login.",
      });
      
      // Switch back to login view with pre-filled credentials
      onSuccessfulRegister(registerEmail, registerPassword);
    } catch (error: any) {
      console.error('Registration error:', error);
      setRegisterError(error.message || 'Erro ao registrar usuário');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-xl font-semibold mb-4">Cadastro</h2>
      
      {registerError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{registerError}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleRegisterSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="register_name">Nome Completo</Label>
          <Input
            id="register_name"
            type="text"
            value={registerName}
            onChange={(e) => setRegisterName(e.target.value)}
            placeholder="Seu Nome Completo"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="register_email">E-mail</Label>
          <Input
            id="register_email"
            type="email"
            value={registerEmail}
            onChange={(e) => setRegisterEmail(e.target.value)}
            placeholder="seu@email.com"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="register_password">Senha</Label>
          <Input
            id="register_password"
            type="password"
            value={registerPassword}
            onChange={(e) => setRegisterPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            required
            minLength={6}
          />
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Cadastrando..." : "Cadastrar"}
        </Button>
      </form>
      
      <div className="mt-4 text-sm text-center">
        Já tem uma conta?{" "}
        <Button 
          variant="link" 
          className="p-0 h-auto font-semibold"
          onClick={onSwitchToLogin}
        >
          Faça login
        </Button>
      </div>
    </>
  );
}
