
import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { Proposal } from '@/lib/types/proposals';
import { formatBrazilianCurrency } from '@/lib/utils';
import { useAuth } from '@/contexts/auth';
import { UserRole } from '@/lib/types';

interface ProposalHistoryProps {
  proposals: Proposal[];
  loading: boolean;
  onDeleteProposal: (id: string) => Promise<boolean>;
}

const ProposalHistory = ({ proposals, loading, onDeleteProposal }: ProposalHistoryProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const { user } = useAuth();

  // Check if current user is admin
  const isAdmin = user?.role === UserRole.ADMIN;

  // Filter proposals based on search term
  const filteredProposals = useMemo(() => {
    return proposals.filter(proposal => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        proposal.data.cnpj?.toLowerCase().includes(searchTermLower) ||
        proposal.data.clientName?.toLowerCase().includes(searchTermLower) ||
        proposal.data.debtNumber?.toLowerCase().includes(searchTermLower) ||
        proposal.userName?.toLowerCase().includes(searchTermLower)
      );
    });
  }, [proposals, searchTerm]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredProposals.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProposals = filteredProposals.slice(startIndex, endIndex);

  // Handle deletion with confirmation
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      if (window.confirm('Tem certeza que deseja excluir esta proposta?')) {
        const success = await onDeleteProposal(id);
        if (success) {
          // Reset to page 1 if current page becomes empty
          const newTotal = Math.ceil((filteredProposals.length - 1) / itemsPerPage);
          if (currentPage > newTotal && newTotal > 0) {
            setCurrentPage(1);
          }
        }
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <Card className="shadow-md rounded-xl w-full">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b dark:border-gray-700">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <User className="h-5 w-5" />
          Histórico de Propostas ({filteredProposals.length})
          {isAdmin && (
            <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded-full">
              Todas as propostas
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Search bar */}
        <div>
          <Input
            placeholder="Buscar por CNPJ, nome, número da proposta ou usuário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />
        </div>

        {/* Proposals list */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-af-blue-500"></div>
            </div>
          ) : currentProposals.length > 0 ? (
            <>
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">CNPJ</th>
                    <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nome / Razão Social</th>
                    {isAdmin && (
                      <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vendedor</th>
                    )}
                    <th scope="col" className="px-2 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Valor Consolidado</th>
                    <th scope="col" className="px-2 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Valor com Reduções</th>
                    <th scope="col" className="px-2 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Desconto</th>
                    <th scope="col" className="px-2 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Honorários</th>
                    <th scope="col" className="px-2 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data</th>
                    <th scope="col" className="px-2 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                  {currentProposals.map((proposal) => (
                    <tr key={proposal.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-gray-200">{proposal.data.cnpj}</td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-gray-200">{proposal.data.clientName}</td>
                      {isAdmin && (
                        <td className="px-2 py-2 whitespace-nowrap text-xs text-purple-600 dark:text-purple-400 font-medium">{proposal.userName}</td>
                      )}
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-right text-gray-900 dark:text-gray-200">
                        R$ {formatBrazilianCurrency(proposal.data.totalDebt)}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-right text-green-700 dark:text-green-400 font-semibold">
                        R$ {formatBrazilianCurrency(proposal.data.discountedValue)}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-center text-gray-900 dark:text-gray-200">
                        {proposal.data.discountPercentage}%
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-right text-purple-700 dark:text-purple-400 font-semibold">
                        R$ {formatBrazilianCurrency(proposal.data.feesValue)}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-center text-gray-900 dark:text-gray-200">
                        {proposal.data.creationDate}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-right text-xs font-medium">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleDelete(proposal.id)}
                            disabled={deletingId === proposal.id}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                            title="Excluir proposta"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    Mostrando {startIndex + 1} a {Math.min(endIndex, filteredProposals.length)} de {filteredProposals.length} propostas
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    
                    {/* Page numbers */}
                    <div className="flex space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Próxima
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center p-4 text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Nenhuma proposta encontrada para a pesquisa.' : 'Nenhuma proposta cadastrada ainda.'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProposalHistory;
