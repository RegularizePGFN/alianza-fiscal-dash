
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
          <Card key={i} className="transition-all duration-300 hover:shadow-md dark:border-gray-700">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="transition-all duration-300 hover:shadow-md dark:border-gray-700 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Propostas Hoje
            </CardTitle>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {results.proposalsCount}
            </div>
          </div>
          <div className="rounded-md bg-blue-100 dark:bg-blue-800/50 p-2 text-blue-700 dark:text-blue-300">
            <FileText className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-blue-600 dark:text-blue-400">Propostas criadas hoje</p>
        </CardContent>
      </Card>
      
      <Card className="transition-all duration-300 hover:shadow-md dark:border-gray-700 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
              Honorários Hoje
            </CardTitle>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(results.totalFees)}
            </div>
          </div>
          <div className="rounded-md bg-green-100 dark:bg-green-800/50 p-2 text-green-700 dark:text-green-300">
            <DollarSign className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-green-600 dark:text-green-400">Total de honorários de hoje</p>
        </CardContent>
      </Card>
      
      <Card className="transition-all duration-300 hover:shadow-md dark:border-gray-700 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Comissões Hoje
            </CardTitle>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(results.totalCommissions)}
            </div>
          </div>
          <div className="rounded-md bg-purple-100 dark:bg-purple-800/50 p-2 text-purple-700 dark:text-purple-300">
            <TrendingUp className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-purple-600 dark:text-purple-400">Total de comissões de hoje</p>
        </CardContent>
      </Card>
    </div>
  );
}
