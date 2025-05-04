
import { ReactNode, useEffect, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { useAuth } from "@/contexts/auth";
import { Navigate } from "react-router-dom";
import { useTheme } from "@/hooks/use-theme";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { SearchDialog } from "@/components/search/SearchDialog";

interface AppLayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export function AppLayout({ children, requireAuth = true }: AppLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const { isDark } = useTheme();
  const [errorDetected, setErrorDetected] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  /* ╭──────────────────────────────────────────────────────────╮
     │ Desfaz "pointer‑events:none" que o listener de atalhos    │
     │ coloca no #root e congela toda a interface                │
     ╰──────────────────────────────────────────────────────────╯ */
  useEffect(() => {
    const root = document.getElementById("root");
    if (!root) return;
    const fix = () => (root.style.pointerEvents = "auto");
    // garante já na primeira carga
    fix();
    const obs = new MutationObserver(fix);
    obs.observe(root, { attributes: true, attributeFilter: ["style"] });
    return () => obs.disconnect();
  }, []);

  // Add error‑boundary detection
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Unhandled error detected:", event.error);
      setErrorDetected(event.message || "An unknown error occurred");
    };
    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when navigating or resizing to larger screen
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Open search dialog
  const handleOpenSearch = () => {
    setSearchOpen(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex flex-col items-center gap-4 p-8 bg-white/30 dark:bg-black/20 backdrop-blur-sm rounded-xl shadow-lg">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-lg font-medium text-muted-foreground animate-pulse">
            Carregando sistema...
          </p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Error screen
  if (errorDetected) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-red-50 to-gray-100 dark:from-red-950 dark:to-gray-900">
        <div className="flex flex-col items-center gap-4 max-w-md p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-center">
          <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
            <span className="text-red-500 dark:text-red-300 text-xl font-bold">!</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Oops! Algo deu errado
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">{errorDetected}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Recarregar a página
          </button>
        </div>
      </div>
    );
  }

  // Main layout with theme transition
  return (
    <div className={`flex h-screen theme-transition ${isDark ? 'dark' : ''} bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800`}>
      <AppSidebar isMobileOpen={isMobileMenuOpen} onMobileClose={() => setIsMobileMenuOpen(false)} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AppHeader onMobileMenuToggle={toggleMobileMenu} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 relative">
          <div className="relative">{children}</div>
        </main>
      </div>
      
      <KeyboardShortcuts onSearchOpen={handleOpenSearch} />
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
