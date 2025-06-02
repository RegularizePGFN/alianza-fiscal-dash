
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SalesSummaryCard } from "@/components/dashboard/SalesSummaryCard";
import { supabase } from "@/integrations/supabase/client";
import { getTodayISO } from "@/lib/utils";
import { FileText, DollarSign, TrendingUp } from "lucide-react";

interface TodayResults {
  proposalsCount: number;
  totalFees: number;
  totalCommissions: number;
}

export function DailyResultsToday() {
  const [results, setResults] = useState<TodayResults>({
    proposalsCount: 0,
    totalFees: 0,
    totalCommissions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodayResults = async () => {
      try {
        setLoading(true);
        const today = getTodayISO();
        
        // Fetch today's proposals
        const { data: proposalsData, error: proposalsError } = await supabase
          .from('proposals')
          .select('fees_value')
          .gte('created_at', `${today}T00:00:00.000Z`)
          .lt('created_at', `${today}T23:59:59.999Z`);

        if (proposalsError) {
          console.error('Error fetching proposals:', proposalsError);
          return;
        }

        const proposalsCount = proposalsData?.length || 0;
        const totalFees = proposalsData?.reduce((sum, proposal) => 
          sum + (proposal.fees_value || 0), 0) || 0;

        // Fetch today's sales with salesperson profiles
        const { data: salesData, error: salesError } = await supabase
          .from('sales')
          .select(`
            gross_amount,
            salesperson_id
          `)
          .eq('sale_date', today);

        if (salesError) {
          console.error('Error fetching sales:', salesError);
          return;
        }

        if (!salesData || salesData.length === 0) {
          setResults({
            proposalsCount,
            totalFees,
            totalCommissions: 0
          });
          return;
        }

        // Get unique salesperson IDs
        const salespersonIds = [...new Set(salesData.map(sale => sale.salesperson_id))];

        // Fetch profiles for all salespeople
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, contract_type')
          .in('id', salespersonIds);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          return;
        }

        // Create a map of salesperson ID to contract type
        const contractTypeMap = new Map();
        profilesData?.forEach(profile => {
          contractTypeMap.set(profile.id, profile.contract_type || 'PJ');
        });

        // Calculate commissions based on contract type
        const totalCommissions = salesData.reduce((sum, sale) => {
          const contractType = contractTypeMap.get(sale.salesperson_id) || 'PJ';
          const saleAmount = Number(sale.gross_amount) || 0;
          
          let commissionRate = 0;
          if (contractType === 'CLT') {
            commissionRate = saleAmount >= 10000 ? 0.1 : 0.05; // 10% or 5%
          } else {
            commissionRate = saleAmount >= 10000 ? 0.25 : 0.2; // 25% or 20%
          }
          
          return sum + (saleAmount * commissionRate);
        }, 0);

        setResults({
          proposalsCount,
          totalFees,
          totalCommissions
        });
      } catch (error) {
        console.error('Error fetching today results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayResults();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="h-32">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <SalesSummaryCard
        title="Propostas Hoje"
        numericValue={results.proposalsCount}
        hideAmount={true}
        icon={<FileText className="h-4 w-4" />}
        description="Propostas criadas hoje"
      />
      
      <SalesSummaryCard
        title="Honorários Hoje"
        amount={results.totalFees}
        icon={<DollarSign className="h-4 w-4" />}
        description="Total de honorários de hoje"
      />
      
      <SalesSummaryCard
        title="Comissões Hoje"
        amount={results.totalCommissions}
        icon={<TrendingUp className="h-4 w-4" />}
        description="Total de comissões de hoje"
      />
    </div>
  );
}
