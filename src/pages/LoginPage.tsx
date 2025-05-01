
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password);
      
      if (!success) {
        toast({
          title: "Falha no login",
          description: "Credenciais inválidas. Verifique seu e-mail e senha.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro durante o login. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogins = [
    { email: 'admin@aliancafiscal.com', role: 'Administrador' },
    { email: 'gestor@aliancafiscal.com', role: 'Gestor' },
    { email: 'silva@aliancafiscal.com', role: 'Vendedor' },
  ];

  const handleDemoLogin = async (email: string) => {
    setEmail(email);
    setPassword('senha123');
    await login(email, 'senha123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full px-6">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Aliança Fiscal</h1>
          <p className="text-gray-600">Intranet de Gestão de Vendas</p>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
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
          
          <div className="mt-8">
            <p className="text-sm text-center text-gray-600 mb-4">Demo - clique para acessar como:</p>
            <div className="flex flex-col space-y-2">
              {demoLogins.map((item) => (
                <Button
                  key={item.email}
                  variant="outline"
                  onClick={() => handleDemoLogin(item.email)}
                  className="text-sm"
                >
                  {item.role}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
