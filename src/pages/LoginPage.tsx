
import { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { Navigate } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { AuthLayout } from '@/components/auth/AuthLayout';

export default function LoginPage() {
  const { isAuthenticated } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Redirect if already logged in
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSuccessfulRegister = (email: string, password: string) => {
    setShowRegister(false);
    setEmail(email);
    setPassword(password);
  };

  return (
    <AuthLayout>
      {!showRegister ? (
        <>
          <LoginForm onSwitchToRegister={() => setShowRegister(true)} />
        </>
      ) : (
        <>
          <RegisterForm 
            onSwitchToLogin={() => setShowRegister(false)} 
            onSuccessfulRegister={handleSuccessfulRegister} 
          />
        </>
      )}
    </AuthLayout>
  );
}
