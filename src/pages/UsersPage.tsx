
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { User, UserRole } from "@/lib/types";
import { MOCK_USERS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Navigate } from "react-router-dom";

export default function UsersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  
  // Redirect if not admin or manager
  if (user?.role !== UserRole.ADMIN && user?.role !== UserRole.MANAGER) {
    return <Navigate to="/" />;
  }
  
  useEffect(() => {
    // In a real app, this would fetch from Supabase
    const usersWithTimestamp = MOCK_USERS.map(user => ({
      ...user,
      created_at: new Date().toISOString(),
    }));
    setUsers(usersWithTimestamp);
  }, []);
  
  const handleEdit = (user: User) => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: `Editar usuário: ${user.name}`,
    });
  };
  
  const handleDelete = (userId: string) => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: `Excluir usuário: ${userId}`,
    });
  };
  
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-destructive">Administrador</Badge>;
      case 'gestor':
        return <Badge className="bg-primary">Gestor</Badge>;
      case 'vendedor':
        return <Badge variant="outline">Vendedor</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Usuários</h2>
            <p className="text-muted-foreground">
              Gerencie os usuários do sistema e suas permissões.
            </p>
          </div>
          
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Usuário
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Todos os Usuários</CardTitle>
            <CardDescription>
              Total de {users.length} usuários ativos no sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead className="w-[70px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{user.created_at && formatDate(user.created_at)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(user)}>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(user.id)}
                          >
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
