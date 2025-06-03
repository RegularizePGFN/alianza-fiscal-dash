
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";

const Index = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  console.log("🏠 [INDEX] Index page render - Auth state:", { 
    isAuthenticated, 
    isLoading, 
    userId: user?.id,
    userEmail: user?.email 
  });

  if (isLoading) {
    console.log("⏳ [INDEX] Showing loading state");
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    console.log("✅ [INDEX] User authenticated, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  console.log("🔐 [INDEX] User not authenticated, redirecting to login");
  return <Navigate to="/login" replace />;
};

export default Index;
