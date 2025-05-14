
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface UsersHeaderProps {
  onAddUser: () => void;
}

export function UsersHeader({ onAddUser }: UsersHeaderProps) {
  return (
    <div className="flex justify-between items-start pb-4 border-b border-gray-200 dark:border-gray-700">
      <div>
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">Usuários</h2>
        <p className="text-muted-foreground mt-1">
          Gerencie os usuários do sistema e suas permissões.
        </p>
      </div>
      
      <Button onClick={onAddUser} className="gap-2">
        <PlusCircle className="h-4 w-4" />
        Novo Usuário
      </Button>
    </div>
  );
}
