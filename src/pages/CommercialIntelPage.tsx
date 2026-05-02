import { Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/auth";
import { UserRole } from "@/lib/types";
import { CommercialIntelContainer } from "@/components/commercial-intel/CommercialIntelContainer";

export default function CommercialIntelPage() {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (user?.role !== UserRole.ADMIN) return <Navigate to="/dashboard" replace />;

  return (
    <AppLayout>
      <CommercialIntelContainer />
    </AppLayout>
  );
}
