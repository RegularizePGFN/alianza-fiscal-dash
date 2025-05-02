
import { useState } from "react";
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

export default function UsersPage() {
  const { user } = useAuth();
  const { users, isLoading, error, fetchUsers } = useUsers();
  
  // Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Redirect if not admin
  if (user?.role !== UserRole.ADMIN) {
    return <Navigate to="/" />;
  }
  
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
  
  const handleSuccess = () => {
    // Refetch users to update the list
    fetchUsers();
  };
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <UsersHeader onAddUser={handleAddUser} />
        
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
