
import { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [loginError, setLoginError] = useState('');

  // Redirect if already logged in
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');

    try {
      const success = await login(email, password);
      
      if (!success) {
        setLoginError('Credenciais inválidas. Verifique seu e-mail e senha.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Ocorreu um erro durante o login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

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
      
      // Switch back to login view
      setShowRegister(false);
      setEmail(registerEmail);
      setPassword(registerPassword);
    } catch (error: any) {
      console.error('Registration error:', error);
      setRegisterError(error.message || 'Erro ao registrar usuário');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full px-6">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Aliança Fiscal</h1>
          <p className="text-gray-600">Intranet de Gestão de Vendas</p>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-8">
          {!showRegister ? (
            <>
              <h2 className="text-xl font-semibold mb-4">Login</h2>
              
              {loginError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Erro</AlertTitle>
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
              
              <div className="mt-6">
                <Separator className="my-4" />
                <p className="text-sm text-center">
                  Não tem uma conta?{" "}
                  <Button 
                    variant="link" 
                    className="p-0 h-auto font-semibold"
                    onClick={() => setShowRegister(true)}
                  >
                    Cadastre-se
                  </Button>
                </p>
              </div>
            </>
          ) : (
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
              
              <div className="mt-6">
                <Separator className="my-4" />
                <p className="text-sm text-center">
                  Já tem uma conta?{" "}
                  <Button 
                    variant="link" 
                    className="p-0 h-auto font-semibold"
                    onClick={() => setShowRegister(false)}
                  >
                    Faça login
                  </Button>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
