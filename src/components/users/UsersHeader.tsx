
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface UsersHeaderProps {
  onAddUser: () => void;
}

export function UsersHeader({ onAddUser }: UsersHeaderProps) {
  return (
    <div className="flex justify-between items-start">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Usuários</h2>
        <p className="text-muted-foreground">
          Gerencie os usuários do sistema e suas permissões.
        </p>
      </div>
      
      <Button onClick={onAddUser}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Novo Usuário
      </Button>
    </div>
  );
}
