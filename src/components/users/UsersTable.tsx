
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, UserRound } from "lucide-react";
import { User, UserRole } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";

interface UsersTableProps {
  users: User[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (user: User) => void;
}

export function UsersTable({
  users,
  isLoading,
  error,
  onRetry,
  onEditUser,
  onDeleteUser,
}: UsersTableProps) {
  const { user: currentUser, impersonateUser } = useAuth();
  const { toast } = useToast();

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return <Badge className="bg-destructive">Administrador</Badge>;
      case UserRole.SALESPERSON:
        return <Badge variant="outline">Vendedor</Badge>;
      default:
        return null;
    }
  };

  const handleImpersonateUser = async (e: React.MouseEvent, userToImpersonate: User) => {
    // Prevent default behavior to avoid page reload
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await impersonateUser(userToImpersonate.id);
      
      toast({
        title: "Sucesso",
        description: `Agora você está visualizando como ${userToImpersonate.name}`,
      });
    } catch (error) {
      console.error("Erro ao impersonar usuário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível acessar a conta do usuário",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-destructive">
        <p>{error}</p>
        <Button variant="outline" onClick={onRetry} className="mt-4">
          Tentar novamente
        </Button>
      </div>
    );
  }

  const isAdmin = currentUser?.role === UserRole.ADMIN;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Função</TableHead>
          <TableHead>Data de Criação</TableHead>
          {isAdmin && <TableHead className="w-[70px]">Acessar</TableHead>}
          <TableHead className="w-[70px]">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length === 0 ? (
          <TableRow>
            <TableCell colSpan={isAdmin ? 6 : 5} className="text-center py-6">
              Nenhum usuário encontrado
            </TableCell>
          </TableRow>
        ) : (
          users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{getRoleBadge(user.role)}</TableCell>
              <TableCell>{user.created_at && formatDate(user.created_at)}</TableCell>
              {isAdmin && (
                <TableCell>
                  {user.id !== currentUser?.id && user.role !== UserRole.ADMIN && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => handleImpersonateUser(e, user)}
                      title={`Entrar como ${user.name}`}
                    >
                      <UserRound className="h-4 w-4" />
                      <span className="sr-only">Entrar como {user.name}</span>
                    </Button>
                  )}
                </TableCell>
              )}
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0"
                      onClick={(e) => {
                        // Prevent dropdown from causing page reload
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <span className="sr-only">Abrir menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onEditUser(user);
                    }}>
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDeleteUser(user);
                      }}
                    >
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
