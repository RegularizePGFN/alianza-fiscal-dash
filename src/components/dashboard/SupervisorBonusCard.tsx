
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Users } from "lucide-react";
import { SupervisorBonus } from "@/lib/supervisorUtils";

interface SupervisorBonusCardProps {
  supervisorBonus: SupervisorBonus & { name: string };
  loading?: boolean;
}

export function SupervisorBonusCard({ supervisorBonus, loading }: SupervisorBonusCardProps) {
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-600" />
            Bonificação Gestora
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

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Award className="h-5 w-5 text-purple-600" />
          Bonificação Gestora
        </CardTitle>
        <CardDescription>
          {supervisorBonus.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium">Vendas da Equipe</th>
                <th className="text-left p-2 font-medium">Faixa</th>
                <th className="text-left p-2 font-medium">Bonificação</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">
                      {formatCurrency(supervisorBonus.teamTotalSales)}
                    </span>
                  </div>
                </td>
                <td className="p-2 text-gray-600">
                  {supervisorBonus.tier}
                </td>
                <td className="p-2">
                  <span className={`font-bold ${getBonusColor(supervisorBonus.amount)}`}>
                    {formatCurrency(supervisorBonus.amount)}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Estrutura de Bonificação */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Estrutura de Bonificação:</h4>
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
