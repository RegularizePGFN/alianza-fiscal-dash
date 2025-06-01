
import { useMemo } from 'react';
import { format, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';

interface ProposalReportData {
  id: string;
  user_id: string;
  user_name: string;
  created_at: string;
  fees_value: number | null;
}

interface DailyProposalCount {
  date: string;
  formattedDate: string;
  count: number;
  fees: number;
}

interface UserProposalStats {
  name: string;
  count: number;
  fees: number;
  color: string;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#af19ff', '#00C49F', '#FFBB28', '#FF8042'];

export const useProposalsChartsData = (
  proposalsData: ProposalReportData[],
  selectedMonth: number,
  selectedYear: number
) => {
  // Dados diários das propostas
  const dailyProposalsData = useMemo(() => {
    console.log("=== DAILY PROPOSALS CHART CALCULATION ===");
    console.log("Proposals data for daily calc:", proposalsData.length);
    
    if (!proposalsData.length) return [];
    
    const targetDate = new Date(selectedYear, selectedMonth - 1, 1);
    const monthStart = startOfMonth(targetDate);
    const monthEnd = endOfMonth(targetDate);
    
    // Criar array de datas para o mês
    const daysInMonth = eachDayOfInterval({
      start: monthStart,
      end: monthEnd
    });
    
    console.log("Days in month to calculate:", daysInMonth.length);
    
    // Inicializar contadores para cada dia
    const dailyCounts: Record<string, DailyProposalCount> = {};
    
    daysInMonth.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const formattedDate = format(day, 'dd/MM');
      
      dailyCounts[dateStr] = {
        date: dateStr,
        formattedDate: formattedDate,
        count: 0,
        fees: 0
      };
    });
    
    // Contar propostas para cada dia
    proposalsData.forEach(proposal => {
      const dateStr = proposal.created_at.split('T')[0];
      if (dailyCounts[dateStr]) {
        dailyCounts[dateStr].count += 1;
        dailyCounts[dateStr].fees += proposal.fees_value || 0;
      }
    });
    
    const result = Object.values(dailyCounts).sort((a, b) => 
      a.date.localeCompare(b.date)
    );
    
    console.log("Daily proposals result sample:", result.slice(0, 3));
    return result;
  }, [proposalsData, selectedMonth, selectedYear]);
  
  // Estatísticas dos usuários
  const userProposalsData = useMemo(() => {
    console.log("=== USER PROPOSALS CHART CALCULATION ===");
    console.log("Proposals data for user calc:", proposalsData.length);
    
    if (!proposalsData.length) return [];
    
    // Contar propostas por usuário
    const userCounts: Record<string, { count: number, fees: number }> = {};
    
    proposalsData.forEach(proposal => {
      if (!userCounts[proposal.user_id]) {
        userCounts[proposal.user_id] = { count: 0, fees: 0 };
      }
      userCounts[proposal.user_id].count += 1;
      userCounts[proposal.user_id].fees += proposal.fees_value || 0;
    });
    
    console.log("User counts calculated:", Object.keys(userCounts).length, "users");
    
    // Converter para array com nomes dos usuários
    const result: UserProposalStats[] = Object.entries(userCounts).map(([userId, stats], index) => {
      const userName = proposalsData.find(p => p.user_id === userId)?.user_name || 'Unknown';
      return {
        name: userName,
        count: stats.count,
        fees: stats.fees,
        color: COLORS[index % COLORS.length]
      };
    }).sort((a, b) => b.count - a.count);
    
    console.log("User proposals chart result:", result.length, "users");
    return result;
  }, [proposalsData]);
  
  return { dailyProposalsData, userProposalsData };
};
