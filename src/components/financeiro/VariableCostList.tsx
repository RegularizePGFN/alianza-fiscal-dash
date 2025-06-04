
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, Calendar, CalendarX, TrendingUp, ArrowUpDown } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

interface VariableCostListProps {
  costs: any[];
  loading: boolean;
  onEdit: (cost: any) => void;
  onDelete: () => void;
  selectedMonth: string;
}

export function VariableCostList({
  costs,
  loading,
  onEdit,
  onDelete,
  selectedMonth
}: VariableCostListProps) {
  const { toast } = useToast();
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleDelete = async (costId: string) => {
    try {
      const { error } = await supabase
        .from('company_costs')
        .delete()
        .eq('id', costId);

      if (error) throw error;

      toast({
        title: "Custo removido",
        description: "O custo foi removido com sucesso."
      });

      onDelete();
    } catch (error: any) {
      console.error('Erro ao remover custo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o custo.",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getSelectedMonthName = () => {
    const [year, month] = selectedMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric'
    });
  };

  const sortedCosts = [...costs].sort((a, b) => {
    return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
  });

  const totalAmount = costs.reduce((sum, cost) => sum + cost.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-muted-foreground">Carregando custos variáveis...</span>
      </div>
    );
  }

  if (costs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium mb-2">Nenhum custo variável encontrado</h3>
        <p className="text-sm text-muted-foreground">
          Nenhum custo variável encontrado para {getSelectedMonthName()}.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Adicione custos variáveis com datas específicas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controles de Ordenação */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Custos de {getSelectedMonthName()}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Ordenar por valor:</span>
          <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  Maior para Menor
                </div>
              </SelectItem>
              <SelectItem value="asc">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  Menor para Maior
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lista de Custos Variáveis */}
      <div className="space-y-3">
        {sortedCosts.map(cost => (
          <Card key={cost.id} className="hover:shadow-md transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{cost.name}</h4>
                    <Badge variant="secondary">Variável</Badge>
                    {cost.category && <Badge variant="outline">{cost.category}</Badge>}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    {cost.start_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Início: {formatDate(cost.start_date)}</span>
                      </div>
                    )}
                    {cost.end_date && (
                      <div className="flex items-center gap-1">
                        <CalendarX className="h-4 w-4" />
                        <span>Término: {formatDate(cost.end_date)}</span>
                      </div>
                    )}
                  </div>
                  
                  {cost.description && (
                    <p className="text-sm text-muted-foreground">{cost.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg text-blue-600 dark:text-blue-400">
                    {formatCurrency(cost.amount)}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => onEdit(cost)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja remover o custo "{cost.name}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(cost.id)}>
                          Remover
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {/* Card de Total */}
        <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                    Total dos Custos Variáveis
                  </h4>
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    {getSelectedMonthName()} • {costs.length} {costs.length === 1 ? 'custo' : 'custos'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                  {formatCurrency(totalAmount)}
                </span>
                <p className="text-sm text-blue-600 dark:text-blue-400">no período</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
