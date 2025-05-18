import React, { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { useDashboard } from "@/hooks/useDashboard";
import { DailyPerformance, DailySalesperson, SortConfig } from "./types";
import { PerformanceCards } from "./PerformanceCards";
import { SalespeopleTable } from "./SalespeopleTable";
import { formatCurrency } from "@/lib/utils";
import { ArrowDown, ArrowUp } from 'lucide-react';

export function DailyResultsContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { proposals } = useDashboard();
  const [salespeople, setSalespeople] = useState<DailySalesperson[]>([]);
  const [salespeopleSortedData, setSalespeopleSortedData] = useState<DailySalesperson[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [dailyPerformance, setDailyPerformance] = useState<DailyPerformance>({
    totalSales: 0,
    totalAmount: 0,
    averageTicket: 0,
  });
  
  useEffect(() => {
    if (user) {
      // Initialize salespeople with the current user and their team members
      const initialSalespeople: DailySalesperson[] = [
        { id: user.id, name: user.name, salesCount: 0, salesAmount: 0 },
        ...(user.teamMembers || []).map((member: any) => ({
          id: member.id,
          name: member.name,
          salesCount: 0,
          salesAmount: 0,
        })),
      ];
      setSalespeople(initialSalespeople);
      setSalespeopleSortedData(initialSalespeople);
    }
  }, [user]);
  
  useEffect(() => {
    const calculateDailyPerformance = () => {
      let totalSales = 0;
      let totalAmount = 0;
      
      salespeople.forEach(person => {
        totalSales += person.salesCount || 0;
        totalAmount += person.salesAmount || 0;
      });
      
      const averageTicket = totalSales > 0 ? totalAmount / totalSales : 0;
      
      setDailyPerformance({
        totalSales,
        totalAmount,
        averageTicket,
      });
    };
    
    calculateDailyPerformance();
  }, [salespeople]);
  
  const handleRequestDemo = () => {
    toast({
      title: "Sucesso",
      description: "Solicitação enviada com sucesso!",
    });
  };

  // In the useEffect function that processes proposal data:
  useEffect(() => {
    const processProposalData = async () => {
      if (!proposals) return;
    
      // Make a copy of the salespeople array
      const updatedSalespeople = [...salespeople];
    
      // Map proposals to salespeople
      proposals.forEach(proposal => {
        // Check if proposal was created today
        const proposalDate = new Date(proposal.createdAt);
        const today = new Date();
      
        if (proposalDate.toDateString() === today.toDateString()) {
          // Find the salesperson by userId
          const existingSalesperson = updatedSalespeople.find(
            person => person.id === proposal.userId
          );
        
          // Update existing salesperson data or create new
          if (existingSalesperson) {
            existingSalesperson.proposalsCount = (existingSalesperson.proposalsCount || 0) + 1;
          
            // Add fees if available - fix the type error here
            if (proposal.data && proposal.data.feesValue) {
              let feesValue = 0;
            
              // Handle different possible types of fees_value
              if (typeof proposal.data.feesValue === 'string') {
                // Remove non-numeric characters except for decimal point and convert to number
                const cleanedValue = proposal.data.feesValue.replace(/[^0-9,.]/g, '').replace(',', '.');
                feesValue = parseFloat(cleanedValue);
              } else if (typeof proposal.data.feesValue === 'number') {
                feesValue = proposal.data.feesValue;
              }
            
              if (!isNaN(feesValue)) {
                existingSalesperson.feesAmount = (existingSalesperson.feesAmount || 0) + feesValue;
              }
            }
          }
        }
      });
    
      // Update state with the processed data
      setSalespeopleSortedData(updatedSalespeople);
    };
  
    // Process data
    processProposalData();
  }, [proposals, salespeople]);

  const requestSort = (key: keyof DailySalesperson) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    
    let sortedData = [...salespeopleSortedData];
    sortedData.sort((a: DailySalesperson, b: DailySalesperson) => {
      const valueA = a[key] || 0;
      const valueB = b[key] || 0;
      if (valueA < valueB) {
        return direction === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    setSalespeopleSortedData(sortedData);
  };
  
  const getSortIndicator = (key: keyof DailySalesperson) => {
    if (sortConfig && sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3 inline-block ml-1" /> : <ArrowDown className="h-3 w-3 inline-block ml-1" />;
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <PerformanceCards performance={dailyPerformance} />
      
      <div className="border rounded-md">
        <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50">
          <h2 className="text-sm font-semibold">Vendedores do Dia</h2>
          <button onClick={handleRequestDemo} className="text-xs text-blue-600 hover:underline">
            Solicitar Demo
          </button>
        </div>
        
        <SalespeopleTable salespeople={salespeopleSortedData} />
        
        <div className="px-4 py-3 bg-gray-50 text-xs text-gray-600">
          <span className="mr-2">Total de vendas: {dailyPerformance.totalSales}</span>
          <span>Valor total: {formatCurrency(dailyPerformance.totalAmount)}</span>
        </div>
      </div>
    </div>
  );
}
