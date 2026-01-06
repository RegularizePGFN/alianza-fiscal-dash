import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RankingEntry {
  salesperson_id: string;
  salesperson_name: string;
  contracts_count: number;
  total_amount: number;
  volume_position: number;
  amount_position: number;
}

export function useMotivationalRanking() {
  return useQuery({
    queryKey: ["motivational-ranking"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_weekly_ranking");
      
      if (error) {
        console.error("Error fetching ranking:", error);
        throw error;
      }
      
      return (data || []) as RankingEntry[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: true,
  });
}

export function getWeekPeriod(): { start: string; end: string } {
  const today = new Date();
  const dayOfWeek = today.getDay();
  // Ajustar para segunda-feira ser o início da semana
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() + diff);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  };
  
  return {
    start: formatDate(weekStart),
    end: formatDate(weekEnd),
  };
}
