
import { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🔐 [LOGIN] Login form submitted for:", email);
    
    setIsLoading(true);
    setLoginError('');

    try {
      console.log("🔄 [LOGIN] Attempting login...");
      const success = await login(email, password);
      
      if (!success) {
        console.log("❌ [LOGIN] Login failed - invalid credentials");
        setLoginError('Credenciais inválidas. Verifique seu e-mail e senha.');
      } else {
        console.log("✅ [LOGIN] Login successful, waiting for redirect...");
      }
    } catch (error) {
      console.error('💥 [LOGIN] Login error:', error);
      console.error('💥 [LOGIN] Error details:', error instanceof Error ? error.message : 'Unknown error');
      setLoginError('Ocorreu um erro durante o login. Tente novamente.');
    } finally {
      setIsLoading(false);
      console.log("🏁 [LOGIN] Login process completed");
    }
  };

  return (
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
      
      <div className="mt-4 text-sm text-center">
        Não tem uma conta?{" "}
        <Button 
          variant="link" 
          className="p-0 h-auto font-semibold"
          onClick={onSwitchToRegister}
        >
          Cadastre-se
        </Button>
      </div>
    </>
  );
}
