
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sale } from "@/lib/types";
import { formatCurrency, getTodayISO } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CircleDollarSign, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DailyResultsCardProps {
  salesData: Sale[];
}

interface DailySalesperson {
  id: string;
  name: string;
  salesCount: number;
  salesAmount: number;
}

export function DailyResultsCard({
  salesData
}: DailyResultsCardProps) {
  const [todaySales, setTodaySales] = useState<Sale[]>([]);
  const [salespeople, setSalespeople] = useState<DailySalesperson[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState<string>("");
  
  useEffect(() => {
    // Get today's date in ISO format (YYYY-MM-DD)
    const todayStr = getTodayISO();
    
    // Format current date for display (dd/mm/yyyy in Portuguese format)
    const today = new Date();
    const formattedDate = new Intl.DateTimeFormat('pt-BR').format(today);
    setCurrentDate(formattedDate);

    // Filter sales for today only
    const filteredSales = salesData.filter(sale => sale.sale_date === todayStr);
    setTodaySales(filteredSales);

    // Fetch all salespeople first
    const fetchAllSalespeople = async () => {
      setLoading(true);
      try {
        const {
          data: profilesData,
          error
        } = await supabase.from("profiles").select("id, name").eq("role", "vendedor");
        if (error) {
          console.error("Error fetching salespeople:", error);
          return;
        }

        // Initialize all salespeople with zero sales
        const allSalespeople = (profilesData || []).map(profile => ({
          id: profile.id,
          name: profile.name || "Sem nome",
          salesCount: 0,
          salesAmount: 0
        }));

        // Update counts for salespeople who made sales today
        filteredSales.forEach(sale => {
          const existingSalesperson = allSalespeople.find(sp => sp.id === sale.salesperson_id);
          if (existingSalesperson) {
            existingSalesperson.salesCount += 1;
            existingSalesperson.salesAmount += sale.gross_amount;
          } else if (sale.salesperson_id) {
            // In case there's a salesperson in the sales data but not in profiles
            allSalespeople.push({
              id: sale.salesperson_id,
              name: sale.salesperson_name || "Sem nome",
              salesCount: 1,
              salesAmount: sale.gross_amount
            });
          }
        });

        // Sort by sales amount (highest first)
        setSalespeople(allSalespeople.sort((a, b) => b.salesAmount - a.salesAmount));
      } catch (error) {
        console.error("Error processing salespeople data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllSalespeople();
  }, [salesData]);

  // Calculate totals
  const totalSalesCount = todaySales.length;
  const totalSalesAmount = todaySales.reduce((sum, sale) => sum + sale.gross_amount, 0);
  
  return <Card className="transition-all duration-300 hover:shadow-md">
      <CardHeader className="pb-2 px-4 pt-4">
        <CardTitle className="text-sm font-medium flex items-center gap-1">
          Resultado do Dia - {currentDate}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
          {/* Summary section - 3 columns */}
          <div className="md:col-span-3 space-y-2 border-r pr-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                <Users className="h-4 w-4 text-purple-700" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total de Vendas</p>
                <h4 className="text-lg font-bold">{totalSalesCount}</h4>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                <CircleDollarSign className="h-4 w-4 text-purple-700" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total em Valor</p>
                <h4 className="text-lg font-bold">{formatCurrency(totalSalesAmount)}</h4>
              </div>
            </div>
          </div>
          
          {/* Salespeople breakdown - 9 columns */}
          <div className="md:col-span-9">
            {loading ? <div className="flex h-[70px] items-center justify-center">
                <p className="text-xs text-muted-foreground">Carregando dados...</p>
              </div> : salespeople.length > 0 ? <div className="max-h-[120px] overflow-y-auto pr-2">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-white z-10">
                    <tr className="border-b">
                      <th className="text-left py-1 font-medium text-muted-foreground">Vendedor</th>
                      <th className="text-center py-1 font-medium text-muted-foreground">Vendas</th>
                      <th className="text-right py-1 font-medium text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salespeople.map(person => <tr key={person.id} className="border-b border-gray-50">
                        <td className="py-1 text-left">{person.name}</td>
                        <td className="text-center py-1">{person.salesCount}</td>
                        <td className="text-right py-1">{formatCurrency(person.salesAmount)}</td>
                      </tr>)}
                  </tbody>
                </table>
              </div> : <div className="flex h-[70px] items-center justify-center text-xs text-muted-foreground">
                Sem vendedores cadastrados
              </div>}
          </div>
        </div>
      </CardContent>
    </Card>;
}
