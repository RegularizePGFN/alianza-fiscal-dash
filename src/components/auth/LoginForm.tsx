
import { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Mail, Lock, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <motion.div
          className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white"
          whileHover={{ scale: 1.05, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <LogIn className="h-5 w-5" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Login</h2>
      </div>
      
      {loginError && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{loginError}</AlertDescription>
          </Alert>
        </motion.div>
      )}
      
      <form onSubmit={handleLoginSubmit} className="space-y-5">
        <motion.div 
          className="space-y-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
            <Mail className="h-4 w-4 text-gray-500" />
            E-mail
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
            className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </motion.div>
        
        <motion.div 
          className="space-y-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium">
            <Lock className="h-4 w-4 text-gray-500" />
            Senha
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            required
            className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button 
            type="submit" 
            className="w-full h-11 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium"
            disabled={isLoading}
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              "Entrar"
            )}
          </Button>
        </motion.div>
      </form>
      
      <motion.div 
        className="mt-6 text-sm text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <span className="text-gray-600 dark:text-gray-400">Não tem uma conta? </span>
        <Button 
          variant="link" 
          className="p-0 h-auto font-semibold text-blue-600 hover:text-blue-700"
          onClick={onSwitchToRegister}
        >
          Cadastre-se
        </Button>
      </motion.div>
    </motion.div>
  );
}
