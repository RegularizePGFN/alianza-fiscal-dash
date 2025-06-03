
import { ReactNode, useEffect, useState } from "react";
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
  const [errorDetected, setErrorDetected] = useState<string | null>(null);

  console.log("🏗️ [LAYOUT] AppLayout render - Auth state:", { 
    isAuthenticated, 
    isLoading, 
    userId: user?.id, 
    userEmail: user?.email,
    requireAuth 
  });

  /* ╭──────────────────────────────────────────────────────────╮
     │ Desfaz "pointer‑events:none" que o listener de atalhos    │
     │ coloca no #root e congela toda a interface                │
     ╰──────────────────────────────────────────────────────────╯ */
  useEffect(() => {
    console.log("🖱️ [LAYOUT] Setting up pointer events fix");
    const root = document.getElementById("root");
    if (!root) {
      console.warn("⚠️ [LAYOUT] Root element not found");
      return;
    }
    const fix = () => {
      root.style.pointerEvents = "auto";
      console.log("🔧 [LAYOUT] Pointer events fixed");
    };
    // garante já na primeira carga
    fix();
    const obs = new MutationObserver(fix);
    obs.observe(root, { attributes: true, attributeFilter: ["style"] });
    return () => {
      console.log("🧹 [LAYOUT] Cleaning up pointer events observer");
      obs.disconnect();
    };
  }, []);

  // Add error‑boundary detection
  useEffect(() => {
    console.log("🛡️ [LAYOUT] Setting up error boundary");
    const handleError = (event: ErrorEvent) => {
      console.error("💥 [LAYOUT] Unhandled error detected:", event.error);
      console.error("💥 [LAYOUT] Error message:", event.message);
      console.error("💥 [LAYOUT] Error filename:", event.filename);
      console.error("💥 [LAYOUT] Error line:", event.lineno);
      console.error("💥 [LAYOUT] Error column:", event.colno);
      setErrorDetected(event.message || "An unknown error occurred");
    };
    
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("💥 [LAYOUT] Unhandled promise rejection:", event.reason);
      setErrorDetected(`Promise rejection: ${event.reason}`);
    };
    
    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    
    return () => {
      console.log("🧹 [LAYOUT] Cleaning up error handlers");
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
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

  // Error screen
  if (errorDetected) {
    console.log("💥 [LAYOUT] Showing error screen:", errorDetected);
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-red-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex flex-col items-center gap-4 max-w-md p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-center">
          <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
            <span className="text-red-500 dark:text-red-300 text-xl font-bold">!</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Oops! Algo deu errado
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">{errorDetected}</p>
          <button
            onClick={() => {
              console.log("🔄 [LAYOUT] User clicked reload");
              window.location.reload();
            }}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Recarregar a página
          </button>
        </div>
      </div>
    );
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
