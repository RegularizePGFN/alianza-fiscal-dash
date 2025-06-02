
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Download, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useCommissionsHistory } from "./hooks/useCommissionsHistory";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import * as XLSX from 'xlsx';

interface CommissionsHistoryCardProps {
  selectedMonth: number;
  selectedYear: number;
}

export function CommissionsHistoryCard({ selectedMonth, selectedYear }: CommissionsHistoryCardProps) {
  const { history, loading } = useCommissionsHistory(selectedMonth, selectedYear);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter history based on search term
  const filteredHistory = useMemo(() => {
    if (!searchTerm) return history;
    
    const searchLower = searchTerm.toLowerCase();
    return history.filter(item => 
      item.salespersonName.toLowerCase().includes(searchLower) ||
      item.clientName.toLowerCase().includes(searchLower) ||
      item.saleDate.includes(searchTerm) ||
      item.grossAmount.toString().includes(searchTerm) ||
      item.commissionAmount.toString().includes(searchTerm)
    );
  }, [history, searchTerm]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredHistory.slice(startIndex, endIndex);

  // Export to Excel
  const handleExport = () => {
    const exportData = filteredHistory.map(item => ({
      'Vendedor': item.salespersonName,
      'Data da Venda': new Date(item.saleDate).toLocaleDateString('pt-BR'),
      'Cliente': item.clientName,
      'Valor Bruto (R$)': item.grossAmount.toFixed(2),
      'Taxa (%)': item.commissionRate,
      'Comissão (R$)': item.commissionAmount.toFixed(2)
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Histórico de Comissões");
    
    const fileName = `historico_comissoes_${selectedMonth}_${selectedYear}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1); // Reset to first page
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico Detalhado de Comissões</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico Detalhado de Comissões</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Export Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Pesquisar por vendedor, cliente, data ou valor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-500">por página</span>
            
            <Button 
              onClick={handleExport}
              variant="outline"
              disabled={filteredHistory.length === 0}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar Excel
            </Button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="text-sm text-gray-500">
          {searchTerm ? (
            <>Mostrando {filteredHistory.length} resultado(s) para "{searchTerm}"</>
          ) : (
            <>Total de {filteredHistory.length} registro(s)</>
          )}
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendedor</TableHead>
              <TableHead>Data da Venda</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="text-right">Valor Bruto</TableHead>
              <TableHead className="text-center">Taxa (%)</TableHead>
              <TableHead className="text-right">Comissão</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                  {searchTerm ? 'Nenhum resultado encontrado para a pesquisa' : 'Nenhuma comissão encontrada para este período'}
                </TableCell>
              </TableRow>
            ) : (
              currentItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.salespersonName}</TableCell>
                  <TableCell>{new Date(item.saleDate).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>{item.clientName}</TableCell>
                  <TableCell className="text-right">R$ {item.grossAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell className="text-center">{item.commissionRate}%</TableCell>
                  <TableCell className="text-right font-medium">
                    R$ {item.commissionAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Mostrando {startIndex + 1} a {Math.min(endIndex, filteredHistory.length)} de {filteredHistory.length} registros
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
      </CardContent>
    </Card>
  );
}
