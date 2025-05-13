
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface UsersHeaderProps {
  onAddUser: () => void;
}

export function UsersHeader({ onAddUser }: UsersHeaderProps) {
  return (
    <div className="flex justify-between items-start">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Usuários</h2>
        <p className="text-sm text-muted-foreground">
          Gerencie os usuários do sistema e suas permissões.
        </p>
      </div>
      
      <Button onClick={onAddUser} size="sm" className="h-9">
        <PlusCircle className="mr-2 h-3.5 w-3.5" />
        Novo Usuário
      </Button>
    </div>
  );
}
