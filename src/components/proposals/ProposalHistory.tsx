
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, FileText, Trash2, Loader2, Search, ArrowUpDown } from "lucide-react";
import { Proposal } from "@/lib/types/proposals";
import { useToast } from "@/hooks/use-toast";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useAuth } from "@/contexts/auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface ProposalHistoryProps {
  proposals: Proposal[];
  isLoading?: boolean;
  onViewProposal: (proposal: Proposal) => void;
  onDeleteProposal: (id: string) => Promise<boolean>;
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

const ProposalHistory = ({ proposals, isLoading = false, onViewProposal, onDeleteProposal }: ProposalHistoryProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  
  const isAdmin = user?.role === 'admin';
  const itemsPerPage = 10;

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const success = await onDeleteProposal(id);
      if (success) {
        toast({
          title: "Proposta excluída",
          description: "A proposta foi removida com sucesso.",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a proposta.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Sorting function
  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filter and sort proposals
  const filteredProposals = proposals.filter(proposal => {
    const searchLower = searchQuery.toLowerCase();
    return (
      proposal.data.cnpj?.toLowerCase().includes(searchLower) ||
      proposal.data.clientName?.toLowerCase().includes(searchLower) ||
      proposal.id.toLowerCase().includes(searchLower)
    );
  });

  const sortedProposals = [...filteredProposals];
  if (sortConfig !== null) {
    sortedProposals.sort((a, b) => {
      let aVal, bVal;
      
      // Handle different data paths based on the sort key
      if (sortConfig.key === 'cnpj') {
        aVal = a.data.cnpj || '';
        bVal = b.data.cnpj || '';
      } else if (sortConfig.key === 'clientName') {
        aVal = a.data.clientName || '';
        bVal = b.data.clientName || '';
      } else if (sortConfig.key === 'totalDebt') {
        aVal = parseFloat((a.data.totalDebt || '0').replace(/[^\d,-]/g, '').replace(',', '.'));
        bVal = parseFloat((b.data.totalDebt || '0').replace(/[^\d,-]/g, '').replace(',', '.'));
      } else if (sortConfig.key === 'discountedValue') {
        aVal = parseFloat((a.data.discountedValue || '0').replace(/[^\d,-]/g, '').replace(',', '.'));
        bVal = parseFloat((b.data.discountedValue || '0').replace(/[^\d,-]/g, '').replace(',', '.'));
      } else if (sortConfig.key === 'discountPercentage') {
        aVal = parseFloat((a.data.discountPercentage || '0').replace(/[^\d,-]/g, '').replace(',', '.'));
        bVal = parseFloat((b.data.discountPercentage || '0').replace(/[^\d,-]/g, '').replace(',', '.'));
      } else if (sortConfig.key === 'feesValue') {
        aVal = parseFloat((a.data.feesValue || '0').replace(/[^\d,-]/g, '').replace(',', '.'));
        bVal = parseFloat((b.data.feesValue || '0').replace(/[^\d,-]/g, '').replace(',', '.'));
      } else {
        // Default to created date
        aVal = new Date(a.createdAt).getTime();
        bVal = new Date(b.createdAt).getTime();
      }

      // Sort based on direction
      if (aVal < bVal) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aVal > bVal) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  // Pagination
  const totalPages = Math.ceil(sortedProposals.length / itemsPerPage);
  const paginatedProposals = sortedProposals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Histórico de Propostas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">Carregando propostas...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (proposals.length === 0) {
    return (
      <Card className="border-border shadow-md rounded-xl">
        <CardHeader className="border-b">
          <CardTitle className="text-lg font-medium">Histórico de Propostas</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-40" />
            <p className="mt-4 text-muted-foreground">Nenhuma proposta gerada ainda.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border shadow-md rounded-xl">
      <CardHeader className="border-b">
        <CardTitle className="text-lg font-semibold mb-4">Histórico de Propostas</CardTitle>
        <div className="flex items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por CNPJ, nome ou número da proposta..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 w-full"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="w-[140px] cursor-pointer hover:bg-muted/50"
                  onClick={() => requestSort('cnpj')}
                >
                  <div className="flex items-center">
                    CNPJ
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => requestSort('clientName')}
                >
                  <div className="flex items-center">
                    Nome / Razão Social
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead 
                  className="text-right cursor-pointer hover:bg-muted/50"
                  onClick={() => requestSort('totalDebt')}
                >
                  <div className="flex items-center justify-end">
                    Valor Consolidado
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead 
                  className="text-right cursor-pointer hover:bg-muted/50"
                  onClick={() => requestSort('discountedValue')}
                >
                  <div className="flex items-center justify-end">
                    Valor com Reduções
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead 
                  className="text-right cursor-pointer hover:bg-muted/50"
                  onClick={() => requestSort('discountPercentage')}
                >
                  <div className="flex items-center justify-end">
                    Desconto
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead 
                  className="text-right cursor-pointer hover:bg-muted/50"
                  onClick={() => requestSort('feesValue')}
                >
                  <div className="flex items-center justify-end">
                    <span className="font-semibold text-af-blue-600">Honorários</span>
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="text-right w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProposals.map((proposal) => (
                <TableRow 
                  key={proposal.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onViewProposal(proposal)}
                >
                  <TableCell className="font-medium">{proposal.data.cnpj}</TableCell>
                  <TableCell>{proposal.data.clientName || '-'}</TableCell>
                  <TableCell className="text-right">R$ {proposal.data.totalDebt}</TableCell>
                  <TableCell className="text-right">R$ {proposal.data.discountedValue}</TableCell>
                  <TableCell className="text-right">{proposal.data.discountPercentage}%</TableCell>
                  <TableCell className="text-right font-semibold text-purple-700">
                    R$ {proposal.data.feesValue || '0,00'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewProposal(proposal);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {isAdmin && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(proposal.id);
                          }}
                          disabled={deletingId === proposal.id}
                          className="text-destructive hover:text-destructive"
                        >
                          {deletingId === proposal.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {totalPages > 1 && (
          <div className="py-4 border-t">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Logic to show pages around current page
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
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        isActive={pageNum === currentPage}
                        onClick={() => setCurrentPage(pageNum)}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => setCurrentPage(totalPages)}
                        className="cursor-pointer"
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProposalHistory;
