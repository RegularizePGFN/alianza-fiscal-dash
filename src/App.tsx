
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import SalesPage from "./pages/SalesPage";
import UsersPage from "./pages/UsersPage";
import ReportsPage from "./pages/ReportsPage";
import CommissionsPage from "./pages/CommissionsPage";
import SettingsPage from "./pages/SettingsPage";
import ProposalsPage from "./pages/proposals"; 
import ProfilePage from "./pages/ProfilePage";
import FinanceiroPage from "./pages/FinanceiroPage";
import NotFound from "./pages/NotFound";
import CalculatorPage from "./pages/CalculatorPage";

const App = () => (
  <TooltipProvider>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/vendas" element={<SalesPage />} />
      <Route path="/usuarios" element={<UsersPage />} />
      <Route path="/relatorios" element={<ReportsPage />} />
      <Route path="/comissoes" element={<CommissionsPage />} />
      <Route path="/configuracoes" element={<SettingsPage />} />
      <Route path="/propostas" element={<ProposalsPage />} />
      <Route path="/perfil" element={<ProfilePage />} />
      <Route path="/financeiro" element={<FinanceiroPage />} />
      <Route path="/calculadora" element={<CalculatorPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
    <Toaster />
    <Sonner />
  </TooltipProvider>
);

export default App;
