
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, TrendingUp, Users, Target } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import { useCosts } from "@/hooks/financeiro/useCosts";
import { formatCurrency } from "@/lib/utils";
import { isWeekend } from "date-fns";

interface ResultProjectionProps {
  selectedMonth: number;
  selectedYear: number;
  currentSales: number;
}

interface SalespersonGoal {
  id: string;
  name: string;
  currentGoal: number;
  projectedSales: number;
}

export function ResultProjection({ 
  selectedMonth, 
  selectedYear, 
  currentSales 
}: ResultProjectionProps) {
  const { users } = useUsers();
  const { costs } = useCosts();
  
  // Estados para simulação
  const [dailyTarget, setDailyTarget] = useState<number>(0);
  const [targetProfit, setTargetProfit] = useState<number>(0);
  const [salespeopleGoals, setSalespeopleGoals] = useState<SalespersonGoal[]>([]);

  // Filtrar apenas vendedores
  const salespeople = users.filter(user => user.role === 'vendedor');

  // Calcular custos totais do mês
  const totalCosts = useMemo(() => {
    const fixedCosts = costs
      .filter(cost => cost.type === 'fixed')
      .reduce((total, cost) => total + Number(cost.amount), 0);
    
    const variableCosts = costs
      .filter(cost => cost.type === 'variable')
      .reduce((total, cost) => total + Number(cost.amount), 0);
    
    return fixedCosts + variableCosts;
  }, [costs]);

  // Calcular dias úteis do mês
  const businessDaysInMonth = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    let businessDays = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedYear, selectedMonth - 1, day);
      if (!isWeekend(date)) {
        businessDays++;
      }
    }
    
    return businessDays;
  }, [selectedMonth, selectedYear]);

  // Calcular dias úteis restantes
  const remainingBusinessDays = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDate();
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    let remaining = 0;
    
    for (let day = currentDay + 1; day <= daysInMonth; day++) {
      const date = new Date(selectedYear, selectedMonth - 1, day);
      if (!isWeekend(date)) {
        remaining++;
      }
    }
    
    return remaining;
  }, [selectedMonth, selectedYear]);

  // Inicializar metas dos vendedores
  const initializeSalespeopleGoals = () => {
    const goals = salespeople.map(person => ({
      id: person.id,
      name: person.name,
      currentGoal: 50000, // Meta padrão de R$ 50.000
      projectedSales: 0
    }));
    setSalespeopleGoals(goals);
  };

  // Atualizar meta individual
  const updateSalespersonGoal = (id: string, field: 'currentGoal' | 'projectedSales', value: number) => {
    setSalespeopleGoals(prev => 
      prev.map(goal => 
        goal.id === id ? { ...goal, [field]: value } : goal
      )
    );
  };

  // Calcular projeções
  const projections = useMemo(() => {
    // Projeção por meta diária
    const dailyProjection = dailyTarget * remainingBusinessDays;
    const totalProjectedSales = currentSales + dailyProjection;
    const commissions = totalProjectedSales * 0.05; // 5% de comissão
    const projectedProfit = totalProjectedSales - totalCosts - commissions;

    // Projeção por vendedores
    const totalSalespeopleProjection = salespeopleGoals.reduce((total, goal) => 
      total + goal.projectedSales, 0
    );
    const salespeopleCommissions = totalSalespeopleProjection * 0.05;
    const salespeopleProfit = totalSalespeopleProjection - totalCosts - salespeopleCommissions;

    // Vendas necessárias para atingir lucro alvo
    const requiredSalesForTarget = targetProfit > 0 
      ? (targetProfit + totalCosts) / 0.95 // Considerando 5% de comissão
      : 0;
    
    const requiredDailySales = requiredSalesForTarget > currentSales
      ? (requiredSalesForTarget - currentSales) / remainingBusinessDays
      : 0;

    return {
      dailyProjection: {
        totalSales: totalProjectedSales,
        profit: projectedProfit,
        margin: totalProjectedSales > 0 ? (projectedProfit / totalProjectedSales) * 100 : 0
      },
      salespeopleProjection: {
        totalSales: totalSalespeopleProjection,
        profit: salespeopleProfit,
        margin: totalSalespeopleProjection > 0 ? (salespeopleProfit / totalSalespeopleProjection) * 100 : 0
      },
      targetAnalysis: {
        requiredSales: requiredSalesForTarget,
        requiredDailySales,
        isAchievable: requiredDailySales <= dailyTarget * 2 // Considera viável se não exceder 2x a meta diária
      }
    };
  }, [dailyTarget, remainingBusinessDays, currentSales, totalCosts, salespeopleGoals, targetProfit]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            Projeção de Resultados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Informações do período */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label className="text-sm text-gray-600">Vendas Atuais</Label>
              <p className="text-lg font-semibold">{formatCurrency(currentSales)}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-600">Custos Totais</Label>
              <p className="text-lg font-semibold text-red-600">{formatCurrency(totalCosts)}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-600">Dias Úteis Restantes</Label>
              <p className="text-lg font-semibold">{remainingBusinessDays}</p>
            </div>
          </div>

          {/* Simulação por Meta Diária */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold">Projeção por Meta Diária</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dailyTarget">Meta de Vendas Diária (R$)</Label>
                <Input
                  id="dailyTarget"
                  type="number"
                  value={dailyTarget}
                  onChange={(e) => setDailyTarget(Number(e.target.value))}
                  placeholder="Ex: 10000"
                />
              </div>
              
              {dailyTarget > 0 && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-gray-600">Vendas Projetadas</Label>
                      <p className="font-semibold text-blue-600">
                        {formatCurrency(projections.dailyProjection.totalSales)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Lucro Projetado</Label>
                      <p className={`font-semibold ${projections.dailyProjection.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(projections.dailyProjection.profit)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-600">Margem Projetada</Label>
                    <p className="font-semibold">
                      {projections.dailyProjection.margin.toFixed(1)}%
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Simulação por Vendedores */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold">Projeção por Vendedores</h3>
              {salespeopleGoals.length === 0 && (
                <Button 
                  onClick={initializeSalespeopleGoals}
                  size="sm"
                  variant="outline"
                >
                  Inicializar Metas
                </Button>
              )}
            </div>

            {salespeopleGoals.length > 0 && (
              <div className="space-y-4">
                <div className="grid gap-4">
                  {salespeopleGoals.map((goal) => (
                    <div key={goal.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                      <div>
                        <Label className="font-medium">{goal.name}</Label>
                      </div>
                      <div>
                        <Label htmlFor={`goal-${goal.id}`}>Meta Mensal (R$)</Label>
                        <Input
                          id={`goal-${goal.id}`}
                          type="number"
                          value={goal.currentGoal}
                          onChange={(e) => updateSalespersonGoal(goal.id, 'currentGoal', Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`projection-${goal.id}`}>Projeção (R$)</Label>
                        <Input
                          id={`projection-${goal.id}`}
                          type="number"
                          value={goal.projectedSales}
                          onChange={(e) => updateSalespersonGoal(goal.id, 'projectedSales', Number(e.target.value))}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {projections.salespeopleProjection.totalSales > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-purple-50 rounded-lg">
                    <div>
                      <Label className="text-gray-600">Total Projetado</Label>
                      <p className="text-lg font-semibold text-purple-600">
                        {formatCurrency(projections.salespeopleProjection.totalSales)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Lucro Projetado</Label>
                      <p className={`text-lg font-semibold ${projections.salespeopleProjection.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(projections.salespeopleProjection.profit)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Margem Projetada</Label>
                      <p className="text-lg font-semibold">
                        {projections.salespeopleProjection.margin.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Análise Reversa - Lucro Alvo */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <h3 className="text-lg font-semibold">Análise Reversa - Lucro Alvo</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="targetProfit">Lucro Líquido Desejado (R$)</Label>
                <Input
                  id="targetProfit"
                  type="number"
                  value={targetProfit}
                  onChange={(e) => setTargetProfit(Number(e.target.value))}
                  placeholder="Ex: 100000"
                />
              </div>
              
              {targetProfit > 0 && (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div>
                      <Label className="text-gray-600">Vendas Necessárias</Label>
                      <p className="font-semibold text-orange-600">
                        {formatCurrency(projections.targetAnalysis.requiredSales)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Vendas Diárias Necessárias</Label>
                      <p className="font-semibold">
                        {formatCurrency(projections.targetAnalysis.requiredDailySales)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Status</Label>
                      <p className={`font-semibold ${projections.targetAnalysis.isAchievable ? 'text-green-600' : 'text-red-600'}`}>
                        {projections.targetAnalysis.isAchievable ? 'Viável' : 'Desafiador'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
