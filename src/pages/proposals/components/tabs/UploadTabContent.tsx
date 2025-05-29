
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AIImageProcessor } from "@/components/proposals/AIImageProcessor";
import ProposalHistory from "@/components/proposals/ProposalHistory";
import { Proposal } from "@/lib/types/proposals";
import { motion } from "framer-motion";
import { Upload, BarChart3, TrendingUp, Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/contexts/auth";
import { UserRole } from "@/lib/types";
import { useMemo } from "react";

interface UploadTabContentProps {
  imagePreview: string | null;
  processing: boolean;
  progressPercent: number;
  companyData: any;
  proposals: Proposal[];
  loadingProposals: boolean;
  onProcessComplete: (data: any) => void;
  onViewProposal: (proposal: Proposal) => void;
  onDeleteProposal: (id: string) => Promise<boolean>;
  setProcessingStatus: (status: string) => void;
}

const UploadTabContent = ({
  imagePreview,
  processing,
  progressPercent,
  companyData,
  proposals,
  loadingProposals,
  onProcessComplete,
  onViewProposal,
  onDeleteProposal,
  setProcessingStatus,
}: UploadTabContentProps) => {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;

  // Calculate today's statistics by user
  const todayStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayProposals = proposals.filter(proposal => 
      proposal.createdAt?.split('T')[0] === today
    );

    // Group by user
    const userStats: Record<string, { count: number; totalFees: number; userName: string }> = {};
    
    todayProposals.forEach(proposal => {
      const userId = proposal.userId;
      const userName = proposal.userName || 'Usuário desconhecido';
      
      if (!userStats[userId]) {
        userStats[userId] = { count: 0, totalFees: 0, userName };
      }
      
      userStats[userId].count++;
      
      // Parse fees value (remove currency formatting)
      const feesValue = parseFloat(proposal.data.feesValue?.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
      userStats[userId].totalFees += feesValue;
    });

    return Object.values(userStats).sort((a, b) => b.count - a.count);
  }, [proposals]);

  const totalTodayProposals = todayStats.reduce((sum, stat) => sum + stat.count, 0);
  const totalTodayFees = todayStats.reduce((sum, stat) => sum + stat.totalFees, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Upload Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-500 to-blue-600 text-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Upload className="h-6 w-6" />
              Análise de Imagem com Inteligência Artificial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AIImageProcessor
              imagePreview={imagePreview}
              processing={processing}
              progressPercent={progressPercent}
              companyData={companyData}
              onProcessComplete={onProcessComplete}
              setProcessingStatus={setProcessingStatus}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Today's Statistics - Only show for admins */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Estatísticas de Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Total de Propostas</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{totalTodayProposals}</p>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-300">Total de Honorários</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {formatCurrency(totalTodayFees)}
                  </p>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800 dark:text-purple-300">Vendedores Ativos</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{todayStats.length}</p>
                </div>
              </div>

              {/* Detailed breakdown by user */}
              {todayStats.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">Detalhamento por Vendedor</h4>
                  <div className="space-y-2">
                    {todayStats.map((stat, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{stat.userName}</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                            {stat.count} proposta{stat.count !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            {formatCurrency(stat.totalFees)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Proposal History - Remove the external card wrapper */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <ProposalHistory
          proposals={proposals}
          loading={loadingProposals}
          onViewProposal={onViewProposal}
          onDeleteProposal={onDeleteProposal}
        />
      </motion.div>
    </motion.div>
  );
};

export default UploadTabContent;
