
import { ReactNode, useEffect } from "react";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { useAuth } from "@/contexts/auth";
import { Navigate } from "react-router-dom";

interface AppLayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export function AppLayout({ children, requireAuth = true }: AppLayoutProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  console.log("🏗️ [LAYOUT] AppLayout render - Auth state:", { 
    isAuthenticated, 
    isLoading, 
    userId: user?.id, 
    userEmail: user?.email,
    requireAuth 
  });

  // Simplificar o fix de pointer events
  useEffect(() => {
    const root = document.getElementById("root");
    if (root) {
      root.style.pointerEvents = "auto";
    }
  }, []);

  // Loading state
  if (isLoading) {
    console.log("⏳ [LAYOUT] Showing loading state");
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex flex-col items-center gap-4 p-8 bg-white/30 dark:bg-black/20 backdrop-blur-sm rounded-xl shadow-lg">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-lg font-medium text-muted-foreground animate-pulse dark:text-gray-300">
            Carregando sistema...
          </p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (requireAuth && !isAuthenticated) {
    console.log("🔐 [LAYOUT] Redirecting to login - user not authenticated");
    return <Navigate to="/login" replace />;
  }

  console.log("✅ [LAYOUT] Rendering main layout for user:", user?.email);

  // Main layout
  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <AppSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 relative">
          <div className="relative">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
