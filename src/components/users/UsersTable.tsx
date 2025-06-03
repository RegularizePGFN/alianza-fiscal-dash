
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Pencil, Trash2, Eye, Users, AlertCircle } from "lucide-react";
import { User, UserRole } from "@/lib/types";
import { UserProfileView } from "./UserProfileView";

interface UsersTableProps {
  users: User[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (user: User) => void;
}

export function UsersTable({ users, isLoading, error, onRetry, onEditUser, onDeleteUser }: UsersTableProps) {
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadge = (role: UserRole) => {
    const roleConfig = {
      [UserRole.ADMIN]: { label: 'Admin', variant: 'destructive' as const },
      [UserRole.VENDEDOR]: { label: 'Vendedor', variant: 'default' as const },
    };

    const config = roleConfig[role] || { label: 'Unknown', variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (viewingUser) {
    return (
      <UserProfileView 
        user={viewingUser} 
        onBack={() => setViewingUser(null)} 
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="flex items-center justify-center gap-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <p className="font-medium">Erro ao carregar usuários</p>
        </div>
        <p className="text-gray-600 text-sm">{error}</p>
        <Button onClick={onRetry} variant="outline" size="sm">
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <Users className="h-8 w-8" />
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-white">Nenhum usuário encontrado</p>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Não há usuários cadastrados no sistema ainda.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border dark:border-gray-700">
      <Table>
        <TableHeader>
          <TableRow className="dark:border-gray-700">
            <TableHead className="dark:text-gray-300">Usuário</TableHead>
            <TableHead className="dark:text-gray-300">Email</TableHead>
            <TableHead className="dark:text-gray-300">Função</TableHead>
            <TableHead className="dark:text-gray-300">Cadastrado em</TableHead>
            <TableHead className="text-right dark:text-gray-300">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="dark:border-gray-700">
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="dark:text-white">{user.name}</span>
                </div>
              </TableCell>
              <TableCell className="dark:text-gray-300">{user.email}</TableCell>
              <TableCell>{getRoleBadge(user.role)}</TableCell>
              <TableCell className="dark:text-gray-300">{formatDate(user.created_at)}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewingUser(user)}
                    className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
                    title="Visualizar como usuário"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditUser(user)}
                    className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
                    title="Editar usuário"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteUser(user)}
                    className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400"
                    title="Excluir usuário"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
