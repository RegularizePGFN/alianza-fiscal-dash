import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ChatwootTestResult {
  tested_at: string;
  auth: { ok: boolean; status: number; message: string };
  extraction: { ok: boolean; cnpj_detected: string | null; message: string };
  persistence: { ok: boolean; cadastro_id: string | null; message: string };
  overall: "ok" | "fail";
  raw_response: any;
}

export function useLastChatbotLead() {
  return useQuery({
    queryKey: ["chatwoot-health", "last-lead"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_registrations")
        .select("created_at")
        .eq("source", "chatbot")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data?.created_at ? new Date(data.created_at) : null;
    },
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}

export function useTodayChatbotCount() {
  return useQuery({
    queryKey: ["chatwoot-health", "today-count"],
    queryFn: async () => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const { count, error } = await supabase
        .from("client_registrations")
        .select("id", { count: "exact", head: true })
        .eq("source", "chatbot")
        .gte("created_at", start.toISOString());
      if (error) throw error;
      return count ?? 0;
    },
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}

export function useTestChatwootConnection() {
  return useMutation({
    mutationFn: async (): Promise<ChatwootTestResult> => {
      const { data, error } = await supabase.functions.invoke("chatwoot-test-connection", {
        body: {},
      });
      if (error) throw error;
      return data as ChatwootTestResult;
    },
  });
}
