import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MotivationalSettings {
  id: string;
  is_active: boolean;
  prize_title: string;
  prize_description: string | null;
  start_date: string | null;
  end_date: string | null;
  display_top_count: number;
  created_at: string;
  updated_at: string;
}

export function useMotivationalSettings() {
  return useQuery({
    queryKey: ["motivational-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("motivational_settings")
        .select("*")
        .single();

      if (error) throw error;
      return data as MotivationalSettings;
    },
  });
}

export function useUpdateMotivationalSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<MotivationalSettings>) => {
      const { data: existing } = await supabase
        .from("motivational_settings")
        .select("id")
        .single();

      if (!existing) throw new Error("Settings not found");

      const { data, error } = await supabase
        .from("motivational_settings")
        .update(settings)
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["motivational-settings"] });
    },
  });
}
