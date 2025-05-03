
import { useState, useCallback, useEffect, useRef } from "react";
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
import React, { useRef, useState /* …outros hooks que já existam … */ } from "react";

export default function UsersPage() {
  const { user } = useAuth();
  const { users, isLoading, error, fetchUsers } = useUsers();
  const { toast } = useToast();
  
  // Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Prevent updates on unmounted component
  const isMountedRef = useRef(true);
  
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // Redirect if not admin
  if (user?.role !== UserRole.ADMIN) {
    return <Navigate to="/" />;
  }
  
  // User management handlers
  const handleAddUser = useCallback(() => {
    if (!isProcessing) {
      setSelectedUser(null);
      setIsFormOpen(true);
    }
  }, [isProcessing]);
  
  const handleEditUser = useCallback((user: User) => {
    if (!isProcessing) {
      setSelectedUser(user);
      setIsFormOpen(true);
    }
  }, [isProcessing]);
  
  const handleDeleteUser = useCallback((user: User) => {
    if (!isProcessing) {
      setSelectedUser(user);
      setIsDeleteDialogOpen(true);
    }
  }, [isProcessing]);
  
  const handleFormClose = useCallback(() => {
    if (!isProcessing) {
      setIsFormOpen(false);
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
    setIsProcessing(true);
    
    const timer = setTimeout(() => {
      if (isMountedRef.current) {
        fetchUsers();
        setIsProcessing(false);
        setIsFormOpen(false);
        setIsDeleteDialogOpen(false);
        setSelectedUser(null);
        
        toast({
          title: "Sucesso",
          description: "Operação realizada com sucesso",
        });
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
      
      {/* User management modals - rendered conditionally */}
      {(isFormOpen || isDeleteDialogOpen) && (
        <>
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
        </>
      )}
    </AppLayout>
  );
}
