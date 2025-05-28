
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
        
        // 1. Fetch all user profiles (remove role filter to include admins)
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, name, role");
          
        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
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
        
        // Initialize all users with zero counts
        const allUsers = (profilesData || []).map(profile => ({
          id: profile.id,
          name: profile.name || "Sem nome",
          salesCount: 0,
          salesAmount: 0,
          proposalsCount: 0,
          feesAmount: 0
        }));

        // Update counts for users who made sales today
        todaySales.forEach(sale => {
          const existingUser = allUsers.find(user => user.id === sale.salesperson_id);
          if (existingUser) {
            existingUser.salesCount += 1;
            existingUser.salesAmount += sale.gross_amount;
          } else if (sale.salesperson_id) {
            // In case there's a salesperson in the sales data but not in profiles
            allUsers.push({
              id: sale.salesperson_id,
              name: sale.salesperson_name || "Sem nome",
              salesCount: 1,
              salesAmount: sale.gross_amount,
              proposalsCount: 0,
              feesAmount: 0
            });
          }
        });
        
        // Update counts for users who created proposals today
        if (proposalsData) {
          proposalsData.forEach(proposal => {
            const existingUser = allUsers.find(user => user.id === proposal.user_id);
            if (existingUser) {
              existingUser.proposalsCount = (existingUser.proposalsCount || 0) + 1;
              
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
                  existingUser.feesAmount = (existingUser.feesAmount || 0) + feesValue;
                }
              }
            } else {
              // In case there's a user in proposals but not in profiles
              console.warn(`User ${proposal.user_id} from proposal not found in profiles`);
            }
          });
        }

        // Filter to show only users who have activity (sales or proposals)
        const activeUsers = allUsers.filter(user => 
          user.salesCount > 0 || user.proposalsCount > 0
        );

        // Apply initial sort to the data
        setSalespeople(sortData(activeUsers));
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
      <h3 className="text-xs font-medium text-muted-foreground mb-1">Usuários Ativos Hoje:</h3>
      {loading ? (
        <div className="flex h-[150px] items-center justify-center">
          <p className="text-xs text-muted-foreground">Carregando dados...</p>
        </div>
      ) : salespeople.length > 0 ? (
        <SalespeopleTable salespeople={salespeople} />
      ) : (
        <div className="flex h-[150px] items-center justify-center text-xs text-muted-foreground">
          Nenhuma atividade registrada hoje
        </div>
      )}
    </div>
  );
}
