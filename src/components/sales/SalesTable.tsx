
import { formatCurrency, formatDate } from "@/lib/utils";
import { Sale } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, FileText } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { useState } from "react";

interface SalesTableProps {
  sales: Sale[];
  showSalesperson?: boolean;
  onEdit?: (sale: Sale) => void;
  onDelete?: (saleId: string) => void;
  onViewDetails?: (sale: Sale) => void;
  pageSize?: number;
}

export function SalesTable({
  sales,
  showSalesperson = false,
  onEdit,
  onDelete,
  onViewDetails,
  pageSize = 10
}: SalesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Paginação dos dados
  const totalPages = Math.max(1, Math.ceil(sales.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, sales.length);
  const currentPageData = sales.slice(startIndex, endIndex);
  
  // Mudar de página
  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    // Scroll para o topo da tabela
    const tableElement = document.querySelector(".sales-table");
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  
  return (
    <div className="rounded-md border sales-table">
      <Table>
        <TableHeader>
          <TableRow>
            {showSalesperson && <TableHead>Vendedor</TableHead>}
            <TableHead>Cliente</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Método</TableHead>
            <TableHead>Parcelas</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            {(onEdit || onDelete || onViewDetails) && <TableHead className="w-[70px]">Ações</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentPageData.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={showSalesperson ? 7 : 6}
                className="h-24 text-center"
              >
                Nenhuma venda encontrada.
              </TableCell>
            </TableRow>
          ) : (
            currentPageData.map((sale) => (
              <TableRow key={sale.id}>
                {showSalesperson && (
                  <TableCell>{sale.salesperson_name}</TableCell>
                )}
                <TableCell>{sale.client_name}</TableCell>
                <TableCell>{formatDate(sale.sale_date)}</TableCell>
                <TableCell>{sale.payment_method}</TableCell>
                <TableCell>
                  {sale.installments > 1
                    ? `${sale.installments}x`
                    : "À vista"}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(sale.gross_amount)}
                </TableCell>
                {(onEdit || onDelete || onViewDetails) && (
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0"
                        >
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onViewDetails && (
                          <DropdownMenuItem
                            onClick={() => onViewDetails(sale)}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Detalhes
                          </DropdownMenuItem>
                        )}
                        {onEdit && (
                          <DropdownMenuItem
                            onClick={() => onEdit(sale)}
                          >
                            Editar
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => onDelete(sale.id)}
                          >
                            Excluir
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      {/* Componente de paginação */}
      {totalPages > 1 && (
        <div className="py-4 flex justify-center">
          <Pagination>
            <Pagination.Content>
              <Pagination.Item>
                <Pagination.Previous 
                  onClick={() => handlePageChange(currentPage - 1)} 
                  disabled={currentPage === 1}
                />
              </Pagination.Item>
              
              {/* Mostrar páginas */}
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                
                // Lógica para exibir páginas: sempre mostra primeira, última e até 3 páginas ao redor da atual
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <Pagination.Item key={pageNum}>
                      <Pagination.Link
                        isActive={pageNum === currentPage}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </Pagination.Link>
                    </Pagination.Item>
                  );
                }
                
                // Adicionar elipses para indicar páginas omitidas
                if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                  return <Pagination.Ellipsis key={`ellipsis-${pageNum}`} />;
                }
                
                return null;
              })}
              
              <Pagination.Item>
                <Pagination.Next
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
              </Pagination.Item>
            </Pagination.Content>
          </Pagination>
        </div>
      )}
    </div>
  );
}
