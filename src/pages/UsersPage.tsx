
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
import { useAuth } from '@/contexts/auth';
import { User, UserRole } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { UserFormModal } from "@/components/users/UserFormModal";
import { DeleteUserDialog } from "@/components/users/DeleteUserDialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ADMIN_EMAILS } from "@/contexts/auth/utils";

export default function UsersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Redirect if not admin or manager
  if (user?.role !== UserRole.ADMIN && user?.role !== UserRole.MANAGER) {
    return <Navigate to="/" />;
  }
  
  // Fetch users from Supabase
  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First, get all users from auth.users via admin API
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error("Error listing users:", authError);
        throw authError;
      }
      
      if (!authData?.users) {
        setUsers([]);
        setIsLoading(false);
        return;
      }
      
      // Then, get profile information
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*");
        
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }
      
      // Merge auth users with profiles data
      const mergedUsers = authData.users.map(authUser => {
        const profile = profilesData?.find(p => p.id === authUser.id) || {};
        
        return {
          id: authUser.id,
          name: profile.name || authUser.email?.split('@')[0] || 'Usuário',
          email: authUser.email || '',
          role: (profile.role as UserRole) || UserRole.SALESPERSON,
          created_at: authUser.created_at,
        };
      });
      
      // Filter out admin users (those with emails in ADMIN_EMAILS)
      const filteredUsers = mergedUsers.filter(u => !ADMIN_EMAILS.includes(u.email.toLowerCase()));
      
      setUsers(filteredUsers);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError(err.message || "Falha ao carregar os usuários.");
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const handleAddUser = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };
  
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };
  
  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };
  
  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedUser(null);
  };
  
  const handleDeleteDialogClose = () => {
    setIsDeleteDialogOpen(false);
    setSelectedUser(null);
  };
  
  const handleSuccess = async () => {
    // Refetch users to update the list
    await fetchUsers();
  };
  
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return <Badge className="bg-destructive">Administrador</Badge>;
      case UserRole.MANAGER:
        return <Badge className="bg-primary">Gestor</Badge>;
      case UserRole.SALESPERSON:
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
          
          <Button onClick={handleAddUser}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Usuário
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Todos os Usuários</CardTitle>
            <CardDescription>
              {isLoading 
                ? "Carregando usuários..." 
                : `Total de ${users.length} usuários ativos no sistema.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-10">
                <LoadingSpinner size="lg" />
              </div>
            ) : error ? (
              <div className="text-center py-10 text-destructive">
                <p>{error}</p>
                <Button 
                  variant="outline" 
                  onClick={fetchUsers} 
                  className="mt-4"
                >
                  Tentar novamente
                </Button>
              </div>
            ) : (
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
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6">
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
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeleteUser(user)}
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
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* User form modal */}
      <UserFormModal
        isOpen={isFormOpen}
        onClose={handleFormClose}
        user={selectedUser || undefined}
        onSuccess={handleSuccess}
      />
      
      {/* Delete confirmation dialog */}
      <DeleteUserDialog
        user={selectedUser}
        isOpen={isDeleteDialogOpen}
        onClose={handleDeleteDialogClose}
        onSuccess={handleSuccess}
      />
    </AppLayout>
  );
}
