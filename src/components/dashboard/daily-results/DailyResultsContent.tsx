
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sale } from "@/lib/types";
import { DailySalesperson } from "./types";
import { SummarySection } from "./SummarySection";
import { SalespeopleTable } from "./SalespeopleTable";
import { useDailyResults } from "./DailyResultsContext";
import { CircleDollarSign, Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface DailyResultsContentProps {
  todaySales: Sale[];
  currentDate: string;
}

export function DailyResultsContent({ todaySales, currentDate }: DailyResultsContentProps) {
  const [salespeople, setSalespeople] = useState<DailySalesperson[]>([]);
  const [loading, setLoading] = useState(true);
  const { sortColumn, sortDirection } = useDailyResults();
  
  // Function to sort salespeople data
  const sortData = (data: DailySalesperson[]) => {
    return [...data].sort((a, b) => {
      if (sortColumn === 'name') {
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else {
        const valueA = a[sortColumn];
        const valueB = b[sortColumn];
        return sortDirection === 'asc' 
          ? (valueA as number) - (valueB as number) 
          : (valueB as number) - (valueA as number);
      }
    });
  };
  
  useEffect(() => {
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
        todaySales.forEach(sale => {
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

        // Apply initial sort to the data
        setSalespeople(sortData(allSalespeople));
      } catch (error) {
        console.error("Error processing salespeople data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllSalespeople();
  }, [todaySales]);
  
  // Apply sorting whenever sort criteria changes
  useEffect(() => {
    setSalespeople(sortData(salespeople));
  }, [sortColumn, sortDirection]);

  // Calculate totals
  const totalSalesCount = todaySales.length;
  const totalSalesAmount = todaySales.reduce((sum, sale) => sum + sale.gross_amount, 0);
  
  // Get top 3 salespeople for today
  const topSalespeople = [...salespeople]
    .sort((a, b) => b.salesAmount - a.salesAmount)
    .slice(0, 3);
  
  return (
    <div className="grid grid-cols-1 gap-3">
      {/* Summary cards with better spacing */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-purple-50 rounded-md p-2 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
            <Users className="h-5 w-5 text-purple-700" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total de Vendas</p>
            <h4 className="text-xl font-bold">{totalSalesCount}</h4>
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-md p-2 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
            <CircleDollarSign className="h-5 w-5 text-purple-700" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total em Valor</p>
            <h4 className="text-xl font-bold">{formatCurrency(totalSalesAmount)}</h4>
          </div>
        </div>
      </div>
      
      {/* Salespeople table with better height management */}
      <div className="bg-white rounded-md p-2">
        <h3 className="text-xs font-medium text-muted-foreground mb-1">Vendedores Hoje:</h3>
        {loading ? (
          <div className="flex h-[80px] items-center justify-center">
            <p className="text-xs text-muted-foreground">Carregando dados...</p>
          </div>
        ) : salespeople.length > 0 ? (
          <div className="max-h-[110px] overflow-y-auto pr-2">
            <SalespeopleTable salespeople={salespeople} />
          </div>
        ) : (
          <div className="flex h-[80px] items-center justify-center text-xs text-muted-foreground">
            Sem vendedores cadastrados
          </div>
        )}
      </div>
      
      {/* Top performers section - new addition */}
      {topSalespeople.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-md p-2">
          <h3 className="text-xs font-medium text-muted-foreground mb-1">Destaques do Dia:</h3>
          <div className="space-y-1.5">
            {topSalespeople.map((person, index) => (
              <div key={person.id} className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="text-sm font-medium mr-2">#{index + 1}</span>
                  <span className="text-sm truncate max-w-[120px]">{person.name}</span>
                </div>
                <span className="text-sm font-semibold">{formatCurrency(person.salesAmount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
