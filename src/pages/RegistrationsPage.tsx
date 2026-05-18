import { Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/auth";
import { RegistrationsContainer } from "@/components/registrations/RegistrationsContainer";

export default function RegistrationsPage() {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <AppLayout>
      <RegistrationsContainer />
    </AppLayout>
  );
}
