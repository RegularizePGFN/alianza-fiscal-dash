
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import SalesPage from './pages/SalesPage';
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';
import NotFound from './pages/NotFound';
import ProfilePage from './pages/ProfilePage';
import ProposalsContainer from './pages/proposals/ProposalsContainer';
import PrintProposalPage from './pages/proposals/PrintProposalPage';
import { AuthProvider } from './contexts/auth';
import { AppLayout } from './components/layout/AppLayout';
import { Toaster } from './components/ui/toaster';
import './App.css';
import './styles/index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          {/* Public proposal print route */}
          <Route path="/propostas/print/:id" element={<PrintProposalPage />} />
          
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="vendas" element={<SalesPage />} />
            <Route path="relatorios" element={<ReportsPage />} />
            <Route path="propostas" element={<ProposalsContainer />} />
            <Route path="usuarios" element={<UsersPage />} />
            <Route path="configuracoes" element={<SettingsPage />} />
            <Route path="perfil" element={<ProfilePage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>

        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
