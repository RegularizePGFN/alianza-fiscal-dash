
import { ProposalsDashboard } from "@/components/proposals/dashboard";

export function ProposalsReportsTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 transition-colors duration-300">
        <h3 className="text-lg font-medium mb-4">Relatórios de Propostas</h3>
        <ProposalsDashboard />
      </div>
    </div>
  );
}
