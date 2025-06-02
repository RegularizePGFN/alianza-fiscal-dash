
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Eye, Trash2 } from 'lucide-react';
import { Proposal } from '@/lib/types/proposals';
import { formatBrazilianCurrency } from '@/lib/utils';

interface ProposalHistoryProps {
  proposals: Proposal[];
  loading: boolean;
  onViewProposal: (proposal: Proposal) => void;
  onDeleteProposal: (id: string) => Promise<boolean>;
}

const ProposalHistory = ({ proposals, loading, onViewProposal, onDeleteProposal }: ProposalHistoryProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter proposals based on search term
  const filteredProposals = proposals.filter(proposal => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      proposal.data.cnpj?.toLowerCase().includes(searchTermLower) ||
      proposal.data.clientName?.toLowerCase().includes(searchTermLower) ||
      proposal.data.debtNumber?.toLowerCase().includes(searchTermLower) ||
      proposal.userName?.toLowerCase().includes(searchTermLower)
    );
  });

  // Handle deletion with confirmation
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      if (window.confirm('Tem certeza que deseja excluir esta proposta?')) {
        const success = await onDeleteProposal(id);
        if (success) {
          // The proposals list will be updated via the parent component
        }
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card className="shadow-md rounded-xl">
      <CardHeader id="history-card-header" className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b dark:border-gray-700">
        <CardTitle className="text-lg font-medium">Histórico de Propostas</CardTitle>
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
          ) : filteredProposals.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">CNPJ ↕</th>
                  <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nome / Razão Social ↕</th>
                  <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Usuário ↕</th>
                  <th scope="col" className="px-2 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Valor Consolidado ↕</th>
                  <th scope="col" className="px-2 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Valor com Reduções ↕</th>
                  <th scope="col" className="px-2 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Desconto ↕</th>
                  <th scope="col" className="px-2 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Honorários ↕</th>
                  <th scope="col" className="px-2 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                {filteredProposals.map((proposal) => (
                  <tr key={proposal.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-gray-200">{proposal.data.cnpj}</td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-gray-200">{proposal.data.clientName}</td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-gray-200">{proposal.userName}</td>
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
                    <td className="px-2 py-2 whitespace-nowrap text-right text-xs font-medium">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => onViewProposal(proposal)}
                          className="text-af-blue-600 hover:text-af-blue-900 dark:text-af-blue-400 dark:hover:text-af-blue-300"
                          title="Visualizar proposta"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
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
