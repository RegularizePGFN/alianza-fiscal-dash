
import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Sale, User } from "@/lib/types";
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
import { MoreHorizontal } from "lucide-react";

interface SalesTableProps {
  sales: Sale[];
  showSalesperson?: boolean;
  onEdit?: (sale: Sale) => void;
  onDelete?: (saleId: string) => void;
}

export function SalesTable({
  sales,
  showSalesperson = false,
  onEdit,
  onDelete,
}: SalesTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {showSalesperson && <TableHead>Vendedor</TableHead>}
            <TableHead>Data</TableHead>
            <TableHead>Método</TableHead>
            <TableHead>Parcelas</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            {(onEdit || onDelete) && <TableHead className="w-[70px]">Ações</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={showSalesperson ? 6 : 5}
                className="h-24 text-center"
              >
                Nenhuma venda encontrada.
              </TableCell>
            </TableRow>
          ) : (
            sales.map((sale) => (
              <TableRow key={sale.id}>
                {showSalesperson && (
                  <TableCell>{sale.salesperson_name}</TableCell>
                )}
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
                {(onEdit || onDelete) && (
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
    </div>
  );
}
