import React, { useState, useCallback, useEffect, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/auth";
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

  /* state dos modais */
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  /* evita setState após unmount */
  const isMountedRef = useRef(true);
  useEffect(() => () => void (isMountedRef.current = false), []);

  /* redireciona se não for admin */
  if (user?.role !== UserRole.ADMIN) return <Navigate to="/" />;

  /* handlers */
  const handleAddUser = useCallback(() => {
    if (!isProcessing) {
      setSelectedUser(null);
      setIsFormOpen(true);
    }
  }, [isProcessing]);

  const handleEditUser = useCallback(
    (u: User) => {
      if (!isProcessing) {
        setSelectedUser(u);
        setIsFormOpen(true);
      }
    },
    [isProcessing]
  );

  const handleDeleteUser = useCallback(
    (u: User) => {
      if (!isProcessing) {
        setSelectedUser(u);
        setIsDeleteDialogOpen(true);
      }
    },
    [isProcessing]
  );

  const handleFormClose = useCallback(
    () => !isProcessing && setIsFormOpen(false),
    [isProcessing]
  );

  const handleDeleteDialogClose = useCallback(() => {
    if (!isProcessing) {
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  }, [isProcessing]);

  const handleSuccess = useCallback(() => {
    setIsProcessing(true);
    const timer = setTimeout(() => {
      if (isMountedRef.current) {
        fetchUsers();
        setIsProcessing(false);
        setIsFormOpen(false);
        setIsDeleteDialogOpen(false);
        setSelectedUser(null);
        toast({ title: "Sucesso", description: "Operação realizada com sucesso" });
      }
    }, 500);
    return () => clearTimeout(timer);
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

      {/* modais condicionais */}
      {isFormOpen && (
        <UserFormModal
          isOpen={isFormOpen}
          onClose={handleFormClose}
          user={selectedUser || undefined}
          onSuccess={handleSuccess}
        />
      )}

      {isDeleteDialogOpen && (
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
