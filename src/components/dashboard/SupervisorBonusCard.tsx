
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, TrendingUp, Users } from "lucide-react";
import { SupervisorBonus } from "@/lib/supervisorUtils";

interface SupervisorBonusCardProps {
  supervisorBonus: SupervisorBonus & { name: string };
  loading?: boolean;
}

export function SupervisorBonusCard({ supervisorBonus, loading }: SupervisorBonusCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-600" />
            Bonificação Supervisora
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-gray-500">Carregando...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getBonusColor = (amount: number) => {
    if (amount >= 2000) return 'text-green-600';
    if (amount >= 1000) return 'text-blue-600';
    if (amount >= 500) return 'text-orange-600';
    return 'text-gray-500';
  };

  const getProgressColor = (amount: number) => {
    if (amount >= 2000) return 'bg-green-100 border-green-200';
    if (amount >= 1000) return 'bg-blue-100 border-blue-200';
    if (amount >= 500) return 'bg-orange-100 border-orange-200';
    return 'bg-gray-100 border-gray-200';
  };

  return (
    <Card className={`${getProgressColor(supervisorBonus.amount)} transition-colors duration-300`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-purple-600" />
          Bonificação Supervisora
        </CardTitle>
        <CardDescription>
          {supervisorBonus.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bonificação Atual */}
        <div className="text-center">
          <p className={`text-3xl font-bold ${getBonusColor(supervisorBonus.amount)}`}>
            {formatCurrency(supervisorBonus.amount)}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Bonificação do Período
          </p>
        </div>

        {/* Informações da Equipe */}
        <div className="flex items-center justify-between p-3 bg-white/70 rounded-lg border">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Total da Equipe</span>
          </div>
          <span className="text-sm font-bold">
            {formatCurrency(supervisorBonus.teamTotalSales)}
          </span>
        </div>

        {/* Faixa Atual */}
        <div className="p-3 bg-white/70 rounded-lg border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Faixa Atual:</span>
            <span className="text-sm text-gray-600">{supervisorBonus.tier}</span>
          </div>
        </div>

        {/* Estrutura de Bonificação */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Estrutura de Bonificação:</h4>
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>R$ 50.000 - R$ 70.000:</span>
              <span className="font-medium">R$ 500</span>
            </div>
            <div className="flex justify-between">
              <span>R$ 70.001 - R$ 100.000:</span>
              <span className="font-medium">R$ 1.000</span>
            </div>
            <div className="flex justify-between">
              <span>Acima de R$ 100.000:</span>
              <span className="font-medium">R$ 2.000</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
