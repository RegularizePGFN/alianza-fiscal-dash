
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sale } from "@/lib/types";
import { formatCurrency, getTodayISO } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CircleDollarSign, Users } from "lucide-react";

interface DailyResultsCardProps {
  salesData: Sale[];
}

interface DailySalesperson {
  id: string;
  name: string;
  salesCount: number;
  salesAmount: number;
}

export function DailyResultsCard({ salesData }: DailyResultsCardProps) {
  const [todaySales, setTodaySales] = useState<Sale[]>([]);
  const [salespeople, setSalespeople] = useState<DailySalesperson[]>([]);
  
  useEffect(() => {
    // Get today's date in ISO format (YYYY-MM-DD)
    const todayStr = getTodayISO();
    
    // Filter sales for today only
    const filteredSales = salesData.filter(sale => 
      sale.sale_date === todayStr
    );
    
    setTodaySales(filteredSales);
    
    // Process salespeople data
    const salespeopleMap = new Map<string, DailySalesperson>();
    
    filteredSales.forEach(sale => {
      if (!salespeopleMap.has(sale.salesperson_id)) {
        salespeopleMap.set(sale.salesperson_id, {
          id: sale.salesperson_id,
          name: sale.salesperson_name || "Sem nome",
          salesCount: 0,
          salesAmount: 0
        });
      }
      
      const sp = salespeopleMap.get(sale.salesperson_id)!;
      sp.salesCount += 1;
      sp.salesAmount += sale.gross_amount;
    });
    
    // Convert map to array and sort by sales amount (highest first)
    setSalespeople(Array.from(salespeopleMap.values())
      .sort((a, b) => b.salesAmount - a.salesAmount));
    
  }, [salesData]);
  
  // Calculate totals
  const totalSalesCount = todaySales.length;
  const totalSalesAmount = todaySales.reduce((sum, sale) => sum + sale.gross_amount, 0);
  
  return (
    <Card className="mt-6 transition-all duration-300 hover:shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          RESULTADO DO DIA
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Summary section - 4 columns */}
          <div className="md:col-span-4 space-y-4 border-r pr-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <Users className="h-5 w-5 text-purple-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Vendas</p>
                <h4 className="text-2xl font-bold">{totalSalesCount}</h4>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <CircleDollarSign className="h-5 w-5 text-purple-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total em Valor</p>
                <h4 className="text-2xl font-bold">{formatCurrency(totalSalesAmount)}</h4>
              </div>
            </div>
          </div>
          
          {/* Salespeople breakdown - 8 columns */}
          <div className="md:col-span-8">
            {salespeople.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Vendedor</TableHead>
                    <TableHead className="text-center">Vendas</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salespeople.map((person) => (
                    <TableRow key={person.id}>
                      <TableCell className="font-medium">{person.name}</TableCell>
                      <TableCell className="text-center">{person.salesCount}</TableCell>
                      <TableCell className="text-right">{formatCurrency(person.salesAmount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex h-[120px] items-center justify-center text-sm text-muted-foreground">
                Sem vendas registradas hoje
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
