
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { formatCurrency } from "@/lib/utils";

interface DailyData {
  day: string;
  value: number;
  count: number;
  date: string;
  formattedDate: string;
}

interface SalesChartProps {
  dailyData: DailyData[];
}

export function SalesChart({ dailyData }: SalesChartProps) {
  // Format data for the tooltip
  const formatTooltip = (value: number, name: string) => {
    if (name === "Vendas") {
      return formatCurrency(value);
    }
    return value;
  };
  
  return (
    <div className="w-full h-32 overflow-hidden">
      <ChartContainer config={{
        sales: {
          color: '#8B5CF6' // Cor primária para vendas (valor)
        },
        count: {
          color: '#2DD4BF' // Cor para quantidade de contratos
        }
      }} className="w-full h-full">
        <ResponsiveContainer width="99%" height="99%">
          <LineChart data={dailyData} margin={{
            top: 5,
            right: 5,
            left: 5,
            bottom: 5
          }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="formattedDate" tick={{
              fontSize: 10
            }} tickMargin={5} />
            <YAxis yAxisId="left" tickFormatter={value => `${value > 1000 ? `${(value / 1000).toFixed(0)}k` : value}`} tick={{
              fontSize: 10
            }} width={30} />
            <YAxis yAxisId="right" orientation="right" tick={{
              fontSize: 10
            }} width={20} domain={[0, 'dataMax + 1']} />
            <Tooltip 
              formatter={formatTooltip} 
              labelFormatter={label => `Dia ${label}`} 
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e0e0e0",
                borderRadius: "4px",
                padding: "8px"
              }} 
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="value" 
              name="Vendas" 
              yAxisId="left" 
              stroke="#8B5CF6" 
              strokeWidth={2} 
              dot={{
                r: 2,
                fill: "#8B5CF6"
              }} 
              activeDot={{
                r: 4,
                stroke: "#8B5CF6",
                strokeWidth: 1,
                fill: "#8B5CF6"
              }} 
              isAnimationActive={false} 
            />
            <Line 
              type="monotone" 
              dataKey="count" 
              name="Contratos" 
              yAxisId="right" 
              stroke="#2DD4BF" 
              strokeWidth={2} 
              dot={{
                r: 2,
                fill: "#2DD4BF"
              }} 
              activeDot={{
                r: 4,
                stroke: "#2DD4BF",
                strokeWidth: 1,
                fill: "#2DD4BF"
              }} 
              isAnimationActive={false} 
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
