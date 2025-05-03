
import { useState, useCallback, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/auth';
import { User, UserRole } from "@/lib/types";
import { Navigate } from "react-router-dom";
import { UsersTable } from "@/components/users/UsersTable";
import { UsersHeader } from "@/components/users/UsersHeader";
import { useUsers } from "@/hooks/useUsers";
import { DeleteUserDialog } from "@/components/users/DeleteUserDialog";
import { UserFormModal } from "@/components/users/UserFormModal";
import { useToast } from "@/hooks/use-toast";

export default function UsersPage() {
  const { user } = useAuth();
  const { users, isLoading, error, fetchUsers } = useUsers();
  const { toast } = useToast();
  
  // Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Redirect if not admin
  if (user?.role !== UserRole.ADMIN) {
    return <Navigate to="/" />;
  }
  
  // User management handlers
  const handleAddUser = useCallback(() => {
    setSelectedUser(null);
    setIsFormOpen(true);
  }, []);
  
  const handleEditUser = useCallback((user: User) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  }, []);
  
  const handleDeleteUser = useCallback((user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  }, []);
  
  const handleFormClose = useCallback(() => {
    console.log("Form close handler called");
    if (!isProcessing) {
      setIsFormOpen(false);
      setSelectedUser(null);
    }
  }, [isProcessing]);
  
  const handleDeleteDialogClose = useCallback(() => {
    if (!isProcessing) {
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  }, [isProcessing]);
  
  const handleSuccess = useCallback(() => {
    // Add delay to ensure database has time to update
    setTimeout(() => {
      fetchUsers();
      setIsProcessing(false);
      
      toast({
        title: "Sucesso",
        description: "Operação realizada com sucesso",
      });
    }, 500);
  }, [fetchUsers, toast]);
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <UsersHeader onAddUser={handleAddUser} />
        
        <Card className="overflow-hidden border-0 shadow-md bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Todos os Usuários</CardTitle>
            <CardDescription>
              {isLoading 
                ? "Carregando usuários..." 
                : `Total de ${users.length} usuários ativos no sistema.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UsersTable
              users={users}
              isLoading={isLoading}
              error={error}
              onRetry={fetchUsers}
              onEditUser={handleEditUser}
              onDeleteUser={handleDeleteUser}
            />
          </CardContent>
        </Card>
      </div>
      
      {/* User form modal */}
      {isFormOpen && (
        <UserFormModal
          isOpen={isFormOpen}
          onClose={handleFormClose}
          user={selectedUser || undefined}
          onSuccess={handleSuccess}
        />
      )}
      
      {/* Delete confirmation dialog */}
      {isDeleteDialogOpen && selectedUser && (
        <DeleteUserDialog
          user={selectedUser}
          isOpen={isDeleteDialogOpen}
          onClose={handleDeleteDialogClose}
          onSuccess={handleSuccess}
        />
      )}
    </AppLayout>
  );
}
