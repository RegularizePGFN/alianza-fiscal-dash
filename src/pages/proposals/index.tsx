
import { useState } from "react";
import ProposalsContainer from "./ProposalsContainer";
import { useAuth } from "@/contexts/auth";
import { Navigate } from "react-router-dom";

export default function ProposalsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Loading state
  if (isLoading) {
    return null; // Layout will show loading spinner
  }
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className="proposal-page-container">
      <style jsx="true">{`
        /* Custom linear gradient for the proposals page */
        .proposal-gradient-header {
          background: linear-gradient(135deg, #FFD400, #FF6A00, #FF0066);
          padding: 1.5rem;
          border-radius: 0.75rem;
          margin-bottom: 1.5rem;
          color: white;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }
      `}</style>
      <ProposalsContainer />
    </div>
  );
}
