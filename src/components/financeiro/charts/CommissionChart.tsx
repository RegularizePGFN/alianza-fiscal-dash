
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { ChartContainer } from "@/components/ui/chart";

interface CommissionChartProps {
  commissions: any[];
}

export function CommissionChart({ commissions }: CommissionChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const chartData = commissions.map(commission => ({
    vendedor: commission.name.split(' ')[0], // Primeiro nome apenas
    comissao: commission.totalCommission,
    vendas: commission.totalSales
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          Comissões por Vendedor
        </CardTitle>
        <CardDescription>
          Distribuição das comissões entre os vendedores no mês
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer 
          config={{
            comissao: { color: '#8B5CF6' }
          }}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="vendedor" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tickFormatter={formatCurrency}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), "Comissão"]}
                labelFormatter={(label) => `Vendedor: ${label}`}
                contentStyle={{ 
                  backgroundColor: "white", 
                  borderRadius: "8px", 
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)" 
                }}
              />
              <Legend />
              <Bar 
                dataKey="comissao" 
                name="Comissão" 
                fill="#8B5CF6" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
