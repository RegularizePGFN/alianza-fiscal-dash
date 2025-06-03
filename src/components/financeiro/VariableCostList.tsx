import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Calendar, CalendarX, TrendingUp } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
  const {
    toast
  } = useToast();
  const handleDelete = async (costId: string) => {
    try {
      const {
        error
      } = await supabase.from('company_costs').delete().eq('id', costId);
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
  const totalAmount = costs.reduce((sum, cost) => sum + cost.amount, 0);
  if (loading) {
    return <div className="text-center py-4">Carregando custos variáveis...</div>;
  }
  if (costs.length === 0) {
    return <div className="text-center py-8 text-gray-500">
        <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>Nenhum custo variável encontrado para {getSelectedMonthName()}.</p>
        <p className="text-sm">Adicione custos variáveis com datas específicas.</p>
      </div>;
  }
  return <div className="space-y-4">
      
      
      <div className="space-y-3">
        {costs.map(cost => <Card key={cost.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{cost.name}</h4>
                    <Badge variant="secondary">Variável</Badge>
                    {cost.category && <Badge variant="outline">{cost.category}</Badge>}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    {cost.start_date && <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Início: {formatDate(cost.start_date)}</span>
                      </div>}
                    {cost.end_date && <div className="flex items-center gap-1">
                        <CalendarX className="h-4 w-4" />
                        <span>Término: {formatDate(cost.end_date)}</span>
                      </div>}
                  </div>
                  
                  {cost.description && <p className="text-sm text-gray-600">{cost.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg">
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
          </Card>)}
        
        {/* Total Summary Card */}
        <Card className="border-2 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-blue-800 dark:text-blue-200">
                  Total dos Custos Variáveis - {getSelectedMonthName()}
                </h4>
              </div>
              <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
}