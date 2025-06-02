
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useCommissionsHistory } from "./hooks/useCommissionsHistory";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CommissionsHistoryCardProps {
  selectedMonth: number;
  selectedYear: number;
}

export function CommissionsHistoryCard({ selectedMonth, selectedYear }: CommissionsHistoryCardProps) {
  const { history, loading } = useCommissionsHistory(selectedMonth, selectedYear);

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
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendedor</TableHead>
              <TableHead>Data da Venda</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Valor Bruto</TableHead>
              <TableHead>Taxa (%)</TableHead>
              <TableHead>Comissão</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                  Nenhuma comissão encontrada para este período
                </TableCell>
              </TableRow>
            ) : (
              history.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.salespersonName}</TableCell>
                  <TableCell>{new Date(item.saleDate).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>{item.clientName}</TableCell>
                  <TableCell>R$ {item.grossAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell>{item.commissionRate}%</TableCell>
                  <TableCell className="font-medium">
                    R$ {item.commissionAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
