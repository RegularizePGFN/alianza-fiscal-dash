
import React from 'react';
import { Separator } from '@/components/ui/separator';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full px-6">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Aliança Fiscal</h1>
          <p className="text-gray-600">Intranet de Gestão de Vendas</p>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
