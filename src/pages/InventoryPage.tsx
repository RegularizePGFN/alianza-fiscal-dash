import { Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/auth";
import { UserRole } from "@/lib/types";
import { InventoryContainer } from "@/components/inventory/InventoryContainer";

export default function InventoryPage() {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (user?.role !== UserRole.ADMIN) return <Navigate to="/dashboard" replace />;

  return (
    <AppLayout>
      <InventoryContainer />
    </AppLayout>
  );
}
