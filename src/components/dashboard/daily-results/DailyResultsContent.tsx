
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sale } from "@/lib/types";
import { DailySalesperson } from "./types";
import { SalespeopleTable } from "./SalespeopleTable";
import { useDailyResults } from "./DailyResultsContext";
import { getTodayISO } from "@/lib/utils";

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
      } else if (sortColumn === 'proposals') {
        const valueA = a.proposalsCount !== undefined ? a.proposalsCount : 0;
        const valueB = b.proposalsCount !== undefined ? b.proposalsCount : 0;
        return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      } else if (sortColumn === 'fees') {
        const valueA = a.feesAmount !== undefined ? a.feesAmount : 0;
        const valueB = b.feesAmount !== undefined ? b.feesAmount : 0;
        return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      } else {
        const valueA = a[sortColumn] !== undefined ? a[sortColumn] as number : 0;
        const valueB = b[sortColumn] !== undefined ? b[sortColumn] as number : 0;
        return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      }
    });
  };
  
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const today = getTodayISO();
        
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, name, role")
          .eq("role", "vendedor");
          
        if (profilesError) {
          console.error("Error fetching salespeople:", profilesError);
          return;
        }
        
        const { data: proposalsData, error: proposalsError } = await supabase
          .from("proposals")
          .select("*")
          .gte("created_at", `${today}T00:00:00`)
          .lte("created_at", `${today}T23:59:59`);
          
        if (proposalsError) {
          console.error("Error fetching proposals:", proposalsError);
        }
        
        const allSalespeople = (profilesData || []).map(profile => ({
          id: profile.id,
          name: profile.name || "Sem nome",
          salesCount: 0,
          salesAmount: 0,
          proposalsCount: 0,
          feesAmount: 0
        }));

        todaySales.forEach(sale => {
          const existingSalesperson = allSalespeople.find(sp => sp.id === sale.salesperson_id);
          if (existingSalesperson) {
            existingSalesperson.salesCount += 1;
            existingSalesperson.salesAmount += sale.gross_amount;
          } else if (sale.salesperson_id) {
            allSalespeople.push({
              id: sale.salesperson_id,
              name: sale.salesperson_name || "Sem nome",
              salesCount: 1,
              salesAmount: sale.gross_amount,
              proposalsCount: 0,
              feesAmount: 0
            });
          }
        });
        
        if (proposalsData) {
          proposalsData.forEach(proposal => {
            const existingSalesperson = allSalespeople.find(sp => sp.id === proposal.user_id);
            if (existingSalesperson) {
              existingSalesperson.proposalsCount = (existingSalesperson.proposalsCount || 0) + 1;
              
              if (proposal.fees_value) {
                let feesValue = 0;
                
                if (typeof proposal.fees_value === 'string') {
                  const cleanedValue = String(proposal.fees_value).replace(/[^0-9,.]/g, '').replace(',', '.');
                  feesValue = parseFloat(cleanedValue);
                } else if (typeof proposal.fees_value === 'number') {
                  feesValue = proposal.fees_value;
                }
                
                if (!isNaN(feesValue)) {
                  existingSalesperson.feesAmount = (existingSalesperson.feesAmount || 0) + feesValue;
                }
              }
            }
          });
        }

        setSalespeople(sortData(allSalespeople));
      } catch (error) {
        console.error("Error processing data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, [todaySales]);
  
  useEffect(() => {
    setSalespeople(prevSalespeople => sortData(prevSalespeople));
  }, [sortColumn, sortDirection]);
  
  if (loading) {
    return (
      <div className="flex h-[180px] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-xs text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }
  
  if (salespeople.length === 0) {
    return (
      <div className="flex h-[180px] items-center justify-center text-sm text-muted-foreground">
        Sem vendedores cadastrados
      </div>
    );
  }
  
  return <SalespeopleTable salespeople={salespeople} />;
}
