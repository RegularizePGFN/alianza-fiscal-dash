
import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Eye, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Proposal } from '@/lib/types/proposals';
import { formatBrazilianCurrency } from '@/lib/utils';
import { DataPagination } from '@/components/ui/data-pagination';
import { DuplicatesButton } from './DuplicatesButton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProposalHistoryProps {
  proposals: Proposal[];
  loading: boolean;
  onViewProposal: (proposal: Proposal) => void;
  onDeleteProposal: (id: string) => Promise<boolean>;
}

type SortField = 'clientName' | 'userName' | 'totalDebt' | 'discountedValue' | 'discountPercentage' | 'feesValue' | 'createdAt';
type SortOrder = 'asc' | 'desc';

const ProposalHistory = ({ proposals, loading, onViewProposal, onDeleteProposal }: ProposalHistoryProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Function to handle column sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Function to get sort icon
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 ml-1 inline" />;
    }
    return sortOrder === 'asc' 
      ? <ArrowUp className="h-3 w-3 ml-1 inline" />
      : <ArrowDown className="h-3 w-3 ml-1 inline" />;
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      return 'Data inválida';
    }
  };

  // Function to parse currency string to number for sorting
  const parseCurrency = (currencyString: string): number => {
    if (!currencyString) return 0;
    return parseFloat(currencyString.replace(/\./g, '').replace(',', '.')) || 0;
  };

  // Filter and sort proposals
  const filteredAndSortedProposals = useMemo(() => {
    // First filter
    let filtered = proposals.filter(proposal => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        proposal.data.cnpj?.toLowerCase().includes(searchTermLower) ||
        proposal.data.clientName?.toLowerCase().includes(searchTermLower) ||
        proposal.data.debtNumber?.toLowerCase().includes(searchTermLower) ||
        proposal.userName?.toLowerCase().includes(searchTermLower)
      );
    });

    // Then sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'clientName':
          aValue = a.data.clientName || '';
          bValue = b.data.clientName || '';
          break;
        case 'userName':
          aValue = a.userName || '';
          bValue = b.userName || '';
          break;
        case 'totalDebt':
          aValue = parseCurrency(a.data.totalDebt);
          bValue = parseCurrency(b.data.totalDebt);
          break;
        case 'discountedValue':
          aValue = parseCurrency(a.data.discountedValue);
          bValue = parseCurrency(b.data.discountedValue);
          break;
        case 'discountPercentage':
          aValue = parseFloat(a.data.discountPercentage) || 0;
          bValue = parseFloat(b.data.discountPercentage) || 0;
          break;
        case 'feesValue':
          aValue = parseCurrency(a.data.feesValue);
          bValue = parseCurrency(b.data.feesValue);
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [proposals, searchTerm, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedProposals.length / pageSize);
  const paginatedProposals = filteredAndSortedProposals.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Header with title and duplicates button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Histórico de Propostas</h3>
        <DuplicatesButton />
      </div>

      {/* Search bar */}
      <div>
        <Input
          placeholder="Buscar por CNPJ, nome, número da proposta ou usuário..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Proposals table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-af-blue-500"></div>
          </div>
        ) : paginatedProposals.length > 0 ? (
          <>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">CNPJ</th>
                  <th 
                    scope="col" 
                    className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleSort('clientName')}
                  >
                    Nome / Razão Social
                    {getSortIcon('clientName')}
                  </th>
                  <th 
                    scope="col" 
                    className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleSort('userName')}
                  >
                    Usuário
                    {getSortIcon('userName')}
                  </th>
                  <th 
                    scope="col" 
                    className="px-2 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleSort('createdAt')}
                  >
                    Data de Criação
                    {getSortIcon('createdAt')}
                  </th>
                  <th 
                    scope="col" 
                    className="px-2 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleSort('totalDebt')}
                  >
                    Valor Consolidado
                    {getSortIcon('totalDebt')}
                  </th>
                  <th 
                    scope="col" 
                    className="px-2 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleSort('discountedValue')}
                  >
                    Valor com Reduções
                    {getSortIcon('discountedValue')}
                  </th>
                  <th 
                    scope="col" 
                    className="px-2 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleSort('discountPercentage')}
                  >
                    Desconto
                    {getSortIcon('discountPercentage')}
                  </th>
                  <th 
                    scope="col" 
                    className="px-2 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleSort('feesValue')}
                  >
                    Honorários
                    {getSortIcon('feesValue')}
                  </th>
                  <th scope="col" className="px-2 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                {paginatedProposals.map((proposal) => (
                  <tr key={proposal.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-gray-200">{proposal.data.cnpj}</td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-gray-200">{proposal.data.clientName}</td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-gray-200">{proposal.userName}</td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-center text-gray-900 dark:text-gray-200">
                      {formatDate(proposal.createdAt)}
                    </td>
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

            {/* Pagination */}
            <DataPagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={filteredAndSortedProposals.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={handlePageSizeChange}
            />
          </>
        ) : (
          <div className="text-center p-4 text-gray-500 dark:text-gray-400">
            {searchTerm ? 'Nenhuma proposta encontrada para a pesquisa.' : 'Nenhuma proposta cadastrada ainda.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProposalHistory;
