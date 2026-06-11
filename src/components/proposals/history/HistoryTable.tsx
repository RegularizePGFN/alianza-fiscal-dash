import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Eye, Trash2, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { Proposal } from '@/lib/types/proposals';
import { formatBrazilianCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
  proposals: Proposal[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  showSeller: boolean;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
  onOpen: (p: Proposal) => void;
  onDelete: (p: Proposal) => void;
}

export const HistoryTable: React.FC<Props> = ({
  proposals,
  total,
  page,
  pageSize,
  isLoading,
  showSeller,
  onPageChange,
  onPageSizeChange,
  onOpen,
  onDelete,
}) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <Card className="border-border/60 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Data</th>
              <th className="px-3 py-2 text-left font-medium">Cliente</th>
              <th className="px-3 py-2 text-left font-medium">CNPJ</th>
              {showSeller && <th className="px-3 py-2 text-left font-medium">Vendedor</th>}
              <th className="px-3 py-2 text-right font-medium">Valor</th>
              <th className="px-3 py-2 text-right font-medium">Com redução</th>
              <th className="px-3 py-2 text-right font-medium">Desconto</th>
              <th className="px-3 py-2 text-right font-medium">Honorários</th>
              <th className="px-3 py-2 text-center font-medium w-[80px]">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-t border-border/40">
                  <td colSpan={showSeller ? 9 : 8} className="p-3">
                    <Skeleton className="h-6 w-full" />
                  </td>
                </tr>
              ))
            ) : proposals.length === 0 ? (
              <tr>
                <td colSpan={showSeller ? 9 : 8} className="p-10 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <FileText className="h-8 w-8 opacity-50" />
                    <p className="text-sm">Nenhuma proposta no período</p>
                  </div>
                </td>
              </tr>
            ) : (
              proposals.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => onOpen(p)}
                  className="border-t border-border/40 hover:bg-muted/40 cursor-pointer transition-colors"
                >
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-muted-foreground">
                    {format(new Date(p.createdAt), 'dd/MM/yy HH:mm', { locale: ptBR })}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap font-medium">
                    {p.data.clientName}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-muted-foreground">
                    {p.data.cnpj}
                  </td>
                  {showSeller && (
                    <td className="px-3 py-2 whitespace-nowrap text-xs">{p.userName}</td>
                  )}
                  <td className="px-3 py-2 whitespace-nowrap text-right tabular-nums">
                    R$ {formatBrazilianCurrency(p.data.totalDebt)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right tabular-nums text-emerald-700 dark:text-emerald-400 font-medium">
                    R$ {formatBrazilianCurrency(p.data.discountedValue)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right tabular-nums">
                    {p.data.discountPercentage}%
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right tabular-nums text-violet-700 dark:text-violet-400 font-medium">
                    R$ {formatBrazilianCurrency(p.data.feesValue)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    <div
                      className="flex justify-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => onOpen(p)}
                        title="Visualizar PDF"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => onDelete(p)}
                        title="Excluir"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 border-t border-border/40 bg-muted/20 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span>
            {start}–{end} de {total}
          </span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="bg-transparent border border-border rounded px-1.5 py-0.5"
          >
            {[10, 25, 50, 100].map((s) => (
              <option key={s} value={s}>
                {s} por página
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="px-2 tabular-nums">
            {page} / {totalPages}
          </span>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default HistoryTable;
