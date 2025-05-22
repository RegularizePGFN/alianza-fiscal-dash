
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
        // Handle proposals sorting (maps to proposalsCount)
        const valueA = a.proposalsCount !== undefined ? a.proposalsCount : 0;
        const valueB = b.proposalsCount !== undefined ? b.proposalsCount : 0;
        return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      } else if (sortColumn === 'fees') {
        // Handle fees sorting (maps to feesAmount)
        const valueA = a.feesAmount !== undefined ? a.feesAmount : 0;
        const valueB = b.feesAmount !== undefined ? b.feesAmount : 0;
        return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      } else {
        // Handle other numeric columns (salesCount, salesAmount)
        const valueA = a[sortColumn] !== undefined ? a[sortColumn] as number : 0;
        const valueB = b[sortColumn] !== undefined ? b[sortColumn] as number : 0;
        
        return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      }
    });
  };
  
  useEffect(() => {
    // Fetch all data needed for the dashboard
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Get today's date in ISO format
        const today = getTodayISO();
        
        // 1. Fetch all salespeople profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, name, role")
          .eq("role", "vendedor");
          
        if (profilesError) {
          console.error("Error fetching salespeople:", profilesError);
          return;
        }
        
        // 2. Fetch today's proposals
        const { data: proposalsData, error: proposalsError } = await supabase
          .from("proposals")
          .select("*")
          .gte("created_at", `${today}T00:00:00`)
          .lte("created_at", `${today}T23:59:59`);
          
        if (proposalsError) {
          console.error("Error fetching proposals:", proposalsError);
        }
        
        console.log("Today's proposals:", proposalsData);
        
        // Initialize all salespeople with zero counts
        const allSalespeople = (profilesData || []).map(profile => ({
          id: profile.id,
          name: profile.name || "Sem nome",
          salesCount: 0,
          salesAmount: 0,
          proposalsCount: 0,
          feesAmount: 0
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
              salesAmount: sale.gross_amount,
              proposalsCount: 0,
              feesAmount: 0
            });
          }
        });
        
        // Update counts for salespeople who created proposals today
        if (proposalsData && proposalsData.length > 0) {
          console.log(`Found ${proposalsData.length} proposals for today`);
          
          proposalsData.forEach(proposal => {
            const existingSalesperson = allSalespeople.find(sp => sp.id === proposal.user_id);
            if (existingSalesperson) {
              existingSalesperson.proposalsCount = (existingSalesperson.proposalsCount || 0) + 1;
              console.log(`Updating proposal count for ${existingSalesperson.name} to ${existingSalesperson.proposalsCount}`);
              
              // Add fees if available
              if (proposal.fees_value) {
                let feesValue = 0;
                
                // Handle different possible types of fees_value
                if (typeof proposal.fees_value === 'string') {
                  // Fix: Cast to string and then use replace
                  const cleanedValue = String(proposal.fees_value).replace(/[^0-9,.]/g, '').replace(',', '.');
                  feesValue = parseFloat(cleanedValue);
                } else if (typeof proposal.fees_value === 'number') {
                  feesValue = proposal.fees_value;
                }
                
                if (!isNaN(feesValue)) {
                  existingSalesperson.feesAmount = (existingSalesperson.feesAmount || 0) + feesValue;
                  console.log(`Updating fees for ${existingSalesperson.name} to ${existingSalesperson.feesAmount}`);
                }
              }
            } else if (proposal.user_id) {
              // If we don't have this salesperson in our list yet, fetch their name
              const fetchSalespersonName = async () => {
                const { data } = await supabase
                  .from("profiles")
                  .select("name")
                  .eq("id", proposal.user_id)
                  .single();
                
                if (data) {
                  // Add new salesperson to our list
                  let feesValue = 0;
                  
                  if (proposal.fees_value) {
                    if (typeof proposal.fees_value === 'string') {
                      const cleanedValue = String(proposal.fees_value).replace(/[^0-9,.]/g, '').replace(',', '.');
                      feesValue = parseFloat(cleanedValue);
                    } else if (typeof proposal.fees_value === 'number') {
                      feesValue = proposal.fees_value;
                    }
                  }
                  
                  allSalespeople.push({
                    id: proposal.user_id,
                    name: data.name || "Sem nome",
                    salesCount: 0,
                    salesAmount: 0,
                    proposalsCount: 1,
                    feesAmount: !isNaN(feesValue) ? feesValue : 0
                  });
                  
                  // Update the state with the new data
                  setSalespeople(sortData([...allSalespeople]));
                }
              };
              
              fetchSalespersonName();
            }
          });
        } else {
          console.log("No proposals found for today");
        }

        // Apply initial sort to the data
        setSalespeople(sortData(allSalespeople));
      } catch (error) {
        console.error("Error processing data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, [todaySales]);
  
  // Apply sorting whenever sort criteria changes
  useEffect(() => {
    setSalespeople(prevSalespeople => sortData(prevSalespeople));
  }, [sortColumn, sortDirection]);
  
  return (
    <div className="bg-white rounded-md p-2">
      <h3 className="text-xs font-medium text-muted-foreground mb-1">Vendedores Hoje:</h3>
      {loading ? (
        <div className="flex h-[150px] items-center justify-center">
          <p className="text-xs text-muted-foreground">Carregando dados...</p>
        </div>
      ) : salespeople.length > 0 ? (
        <SalespeopleTable salespeople={salespeople} />
      ) : (
        <div className="flex h-[150px] items-center justify-center text-xs text-muted-foreground">
          Sem vendedores cadastrados
        </div>
      )}
    </div>
  );
}
