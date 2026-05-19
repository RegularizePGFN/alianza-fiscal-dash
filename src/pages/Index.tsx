import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { UserRole } from "@/lib/types";

const Index = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    if (user?.role === UserRole.BACKOFFICE) {
      return <Navigate to="/cadastros" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
};

export default Index;
