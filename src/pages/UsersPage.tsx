
import { useState, useCallback } from "react";
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
  
  // User management handlers
  const handleAddUser = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
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
    if (!isProcessing) {
      setIsFormOpen(false);
    }
  }, [isProcessing]);
  
  const handleDeleteDialogClose = useCallback(() => {
    if (!isProcessing) {
      setIsDeleteDialogOpen(false);
    }
  }, [isProcessing]);
  
  const handleSuccess = useCallback(() => {
    // Add delay to ensure database has time to update and force refresh
    setIsProcessing(true);
    setTimeout(() => {
      fetchUsers();
      setIsProcessing(false);
      setIsFormOpen(false);
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      
      toast({
        title: "Sucesso",
        description: "Operação realizada com sucesso. Recarregando dados...",
      });

      // Force a page refresh to ensure all components get the updated data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }, 500);
  }, [fetchUsers, toast]);
  
  // Check for user role - IMPORTANT: We're not using early return as it would break hooks
  if (user?.role !== UserRole.ADMIN) {
    return <Navigate to="/" />;
  }
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <UsersHeader onAddUser={handleAddUser} />
        
        <Card className="overflow-hidden border-0 shadow-md bg-white/80 backdrop-blur-sm dark:bg-gray-800/90 dark:border-gray-700 transition-all duration-300">
          <CardHeader className="dark:border-gray-700">
            <CardTitle className="dark:text-white">Todos os Usuários</CardTitle>
            <CardDescription className="dark:text-gray-300">
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
