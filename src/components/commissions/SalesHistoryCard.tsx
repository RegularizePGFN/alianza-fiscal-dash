
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, FileDown, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useSales } from '@/hooks/sales';
import { DataPagination } from '@/components/ui/data-pagination';
import { exportSalesToExcel } from '@/lib/excelUtils';
import { Sale } from '@/lib/types';

interface SalesHistoryCardProps {
  selectedMonth: string;
}

export function SalesHistoryCard({ selectedMonth }: SalesHistoryCardProps) {
  const { sales, loading } = useSales();
  const [searchTerm, setSearchTerm] = useState('');
  const [salespersonFilter, setSalespersonFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter sales based on selected month and filters
  const filteredSales = useMemo(() => {
    let filtered = sales.filter(sale => {
      const saleMonth = sale.sale_date.substring(0, 7); // YYYY-MM format
      return saleMonth === selectedMonth;
    });

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(sale =>
        sale.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.client_phone.includes(searchTerm) ||
        sale.client_document.includes(searchTerm) ||
        sale.gross_amount.toString().includes(searchTerm)
      );
    }

    // Apply salesperson filter
    if (salespersonFilter !== 'all') {
      filtered = filtered.filter(sale => sale.salesperson_id === salespersonFilter);
    }

    // Apply date filter
    if (dateFilter) {
      filtered = filtered.filter(sale => sale.sale_date === dateFilter);
    }

    return filtered.sort((a, b) => new Date(b.sale_date).getTime() - new Date(a.sale_date).getTime());
  }, [sales, selectedMonth, searchTerm, salespersonFilter, dateFilter]);

  // Get unique salespeople for filter
  const salespeople = useMemo(() => {
    const uniqueSalespeople = Array.from(
      new Set(sales.map(sale => sale.salesperson_id))
    ).map(id => {
      const sale = sales.find(s => s.salesperson_id === id);
      return {
        id: id,
        name: sale?.salesperson_name || 'Desconhecido'
      };
    });
    return uniqueSalespeople;
  }, [sales]);

  // Pagination
  const totalPages = Math.ceil(filteredSales.length / pageSize);
  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleExport = () => {
    exportSalesToExcel(filteredSales);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico Detalhado de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Histórico Detalhado de Vendas
          <Button onClick={handleExport} size="sm" className="flex items-center gap-2">
            <FileDown className="h-4 w-4" />
            Exportar Excel
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Pesquisar cliente, telefone, documento ou valor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={salespersonFilter} onValueChange={setSalespersonFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por vendedor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os vendedores</SelectItem>
              {salespeople.map((sp) => (
                <SelectItem key={sp.id} value={sp.id}>
                  {sp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-10"
            />
          </div>

          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm('');
              setSalespersonFilter('all');
              setDateFilter('');
              setCurrentPage(1);
            }}
          >
            Limpar Filtros
          </Button>
        </div>

        {/* Results Summary */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {filteredSales.length} vendas encontradas
            {filteredSales.length > 0 && (
              <span className="ml-2">
                • Total: {filteredSales.reduce((sum, sale) => sum + sale.gross_amount, 0).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}
              </span>
            )}
          </p>
        </div>

        {/* Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Forma Pagamento</TableHead>
                <TableHead className="text-center">Parcelas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    Nenhuma venda encontrada
                  </TableCell>
                </TableRow>
              ) : (
                paginatedSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>
                      {format(new Date(sale.sale_date), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>{sale.salesperson_name}</TableCell>
                    <TableCell>{sale.client_name}</TableCell>
                    <TableCell>{sale.client_phone}</TableCell>
                    <TableCell>{sale.client_document}</TableCell>
                    <TableCell className="text-right font-medium">
                      {sale.gross_amount.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </TableCell>
                    <TableCell className="capitalize">{sale.payment_method}</TableCell>
                    <TableCell className="text-center">{sale.installments}x</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {filteredSales.length > 0 && (
          <DataPagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredSales.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </CardContent>
    </Card>
  );
}
