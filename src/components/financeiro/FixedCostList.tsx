import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Building } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
interface FixedCostListProps {
  costs: any[];
  loading: boolean;
  onEdit: (cost: any) => void;
  onDelete: () => void;
}
export function FixedCostList({
  costs,
  loading,
  onEdit,
  onDelete
}: FixedCostListProps) {
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
  const totalAmount = costs.reduce((sum, cost) => sum + cost.amount, 0);
  if (loading) {
    return <div className="text-center py-4">Carregando custos fixos...</div>;
  }
  if (costs.length === 0) {
    return <div className="text-center py-8 text-gray-500">
        <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>Nenhum custo fixo cadastrado ainda.</p>
        <p className="text-sm">Adicione custos fixos recorrentes como aluguel, salários, etc.</p>
      </div>;
  }
  return <div className="space-y-4">
      
      
      <div className="space-y-3">
        {costs.map(cost => <Card key={cost.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{cost.name}</h4>
                    <Badge variant="secondary">Fixo</Badge>
                    {cost.category && <Badge variant="outline">{cost.category}</Badge>}
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
        <Card className="border-2 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold text-green-800 dark:text-green-200">
                  Total dos Custos Fixos
                </h4>
              </div>
              <span className="text-2xl font-bold text-green-700 dark:text-green-300">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
}