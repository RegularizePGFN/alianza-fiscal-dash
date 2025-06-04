import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, Building, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

interface FixedCost {
  id: string;
  name: string;
  description?: string;
  amount: number;
  category?: string;
}

interface FixedCostListProps {
  costs: FixedCost[];
  loading: boolean;
  onEdit: (cost: FixedCost) => void;
  onDelete: () => void;
}

export function FixedCostList({
  costs,
  loading,
  onEdit,
  onDelete
}: FixedCostListProps) {
  const { toast } = useToast();
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [categorySortOrders, setCategorySortOrders] = useState<Record<string, 'asc' | 'desc'>>({});

  const handleDelete = async (costId: string) => {
    try {
      const { error } = await supabase.from('company_costs').delete().eq('id', costId);
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

  const sortedCosts = [...costs].sort((a, b) => {
    return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
  });

  // Agrupar custos por categoria com tipagem correta
  const costsByCategory = sortedCosts.reduce((acc: Record<string, FixedCost[]>, cost) => {
    const category = cost.category || 'Sem Categoria';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(cost);
    return acc;
  }, {});

  const handleCategorySortToggle = (category: string) => {
    setCategorySortOrders(prev => ({
      ...prev,
      [category]: prev[category] === 'desc' ? 'asc' : 'desc'
    }));
  };

  const getSortedCostsForCategory = (categoryCosts: FixedCost[], category: string) => {
    const categorySort = categorySortOrders[category] || 'desc';
    return [...categoryCosts].sort((a, b) => {
      return categorySort === 'desc' ? b.amount - a.amount : a.amount - b.amount;
    });
  };

  const totalAmount = costs.reduce((sum, cost) => sum + cost.amount, 0);

  if (loading) {
    return <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-muted-foreground">Carregando custos fixos...</span>
      </div>;
  }

  if (costs.length === 0) {
    return <div className="text-center py-12 text-gray-500">
        <Building className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium mb-2">Nenhum custo fixo cadastrado</h3>
        <p className="text-sm text-muted-foreground">
          Adicione custos fixos recorrentes como aluguel, salários, etc.
        </p>
      </div>;
  }

  const CostItem = ({ cost }: { cost: FixedCost; }) => (
    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700 hover:shadow-sm transition-all duration-200">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">{cost.name}</h4>
          <Badge variant="secondary" className="text-xs">Fixo</Badge>
        </div>
        {cost.description && <p className="text-xs text-muted-foreground line-clamp-1">{cost.description}</p>}
      </div>
      <div className="flex items-center gap-2">
        <span className="font-semibold text-green-600 dark:text-green-400">
          {formatCurrency(cost.amount)}
        </span>
        <Button variant="ghost" size="sm" onClick={() => onEdit(cost)} className="h-8 w-8 p-0">
          <Edit className="h-3 w-3" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-700">
              <Trash2 className="h-3 w-3" />
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
  );

  // Cores mais vibrantes para os cabeçalhos das categorias
  const categoryColors = [
    'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700',
    'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700',
    'bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700',
    'bg-rose-100 dark:bg-rose-900/30 border-rose-300 dark:border-rose-700',
    'bg-teal-100 dark:bg-teal-900/30 border-teal-300 dark:border-teal-700',
    'bg-indigo-100 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700',
  ];

  return (
    <div className="space-y-6">
      {/* Controles de Ordenação */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Custos por Categoria
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Ordenar por valor:</span>
          <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
            <SelectTrigger className="w-60">
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

      {/* Cards por Categoria */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(costsByCategory).map(([category, categoryCosts], index) => {
          const categoryTotal = (categoryCosts as FixedCost[]).reduce((sum: number, cost: FixedCost) => sum + cost.amount, 0);
          const sortedCategoryCosts = getSortedCostsForCategory(categoryCosts as FixedCost[], category);
          const categorySort = categorySortOrders[category] || 'desc';
          const colorClass = categoryColors[index % categoryColors.length];
          
          return (
            <Card key={category} className="hover:shadow-md transition-shadow duration-200">
              <CardHeader className={`pb-3 ${colorClass}`}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {category}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {(categoryCosts as FixedCost[]).length} {(categoryCosts as FixedCost[]).length === 1 ? 'item' : 'itens'}
                  </Badge>
                </div>
                
                {/* Cabeçalho clicável para ordenação */}
                <div className="flex items-center justify-between bg-white/50 dark:bg-gray-800/30 rounded-lg p-3 mt-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total da categoria:
                  </span>
                  <button 
                    onClick={() => handleCategorySortToggle(category)} 
                    className="flex items-center gap-1 text-lg font-bold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
                  >
                    {formatCurrency(categoryTotal)}
                    {categorySort === 'desc' ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                  </button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {(sortedCategoryCosts as FixedCost[]).map((cost: FixedCost) => (
                    <CostItem key={cost.id} cost={cost} />
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Card de Total Consolidado */}
      <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 dark:border-green-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-800/50 rounded-lg">
                <Building className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-green-800 dark:text-green-200">
                  Total dos Custos Fixos
                </h4>
                <p className="text-sm text-green-600 dark:text-green-300">
                  {costs.length} {costs.length === 1 ? 'custo cadastrado' : 'custos cadastrados'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-green-700 dark:text-green-300">
                {formatCurrency(totalAmount)}
              </span>
              <p className="text-sm text-green-600 dark:text-green-400">por mês</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
