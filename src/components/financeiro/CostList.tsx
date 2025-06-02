
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Building, TrendingUp } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CostListProps {
  costs: any[];
  loading: boolean;
  onEdit: (cost: any) => void;
  onDelete: () => void;
}

export function CostList({ costs, loading, onEdit, onDelete }: CostListProps) {
  const { toast } = useToast();

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

  if (loading) {
    return <div className="text-center py-4">Carregando custos...</div>;
  }

  if (costs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>Nenhum custo cadastrado ainda.</p>
        <p className="text-sm">Adicione custos para começar a monitorar seu lucro líquido.</p>
      </div>
    );
  }

  const fixedCosts = costs.filter(cost => cost.type === 'fixed');
  const variableCosts = costs.filter(cost => cost.type === 'variable');

  return (
    <div className="space-y-6">
      {fixedCosts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Building className="h-5 w-5" />
            Custos Fixos
          </h3>
          <div className="space-y-2">
            {fixedCosts.map((cost) => (
              <Card key={cost.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{cost.name}</h4>
                        <Badge variant="secondary">Fixo</Badge>
                        {cost.category && (
                          <Badge variant="outline">{cost.category}</Badge>
                        )}
                      </div>
                      {cost.description && (
                        <p className="text-sm text-gray-600">{cost.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">
                        {formatCurrency(cost.amount)}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(cost)}
                      >
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
          </div>
        </div>
      )}

      {variableCosts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Custos Variáveis
          </h3>
          <div className="space-y-2">
            {variableCosts.map((cost) => (
              <Card key={cost.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{cost.name}</h4>
                        <Badge variant="secondary">Variável</Badge>
                        {cost.category && (
                          <Badge variant="outline">{cost.category}</Badge>
                        )}
                      </div>
                      {cost.description && (
                        <p className="text-sm text-gray-600">{cost.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">
                        {formatCurrency(cost.amount)}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(cost)}
                      >
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
          </div>
        </div>
      )}
    </div>
  );
}
