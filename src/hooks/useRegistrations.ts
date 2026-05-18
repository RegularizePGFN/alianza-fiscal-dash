import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type RegistrationStatus = "aguardando" | "pendente" | "realizado" | "cancelado";
export type RegistrationReason = "fazer_cadastro" | "alterar_cadastro" | "receita_federal" | "cancelar_acesso";

export interface ClientRegistration {
  id: string;
  salesperson_id: string;
  salesperson_name: string;
  client_name: string;
  client_phone: string | null;
  cnpj: string | null;
  cpf: string | null;
  reason: RegistrationReason;
  status: RegistrationStatus;
  notes: string | null;
  backoffice_id: string | null;
  backoffice_name: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RegistrationAttachment {
  id: string;
  registration_id: string;
  file_url: string;
  uploaded_by: string;
  uploaded_by_name: string | null;
  uploaded_at: string;
}

export interface RegistrationEvent {
  id: string;
  registration_id: string;
  from_status: RegistrationStatus | null;
  to_status: RegistrationStatus;
  changed_by: string;
  changed_by_name: string | null;
  note: string | null;
  created_at: string;
}

export const REGISTRATION_REASONS: { value: RegistrationReason; label: string }[] = [
  { value: "fazer_cadastro", label: "Fazer cadastro" },
  { value: "alterar_cadastro", label: "Alterar cadastro" },
  { value: "receita_federal", label: "Receita Federal" },
  { value: "cancelar_acesso", label: "Cancelar acesso" },
];

export const REGISTRATION_STATUSES: { value: RegistrationStatus; label: string }[] = [
  { value: "aguardando", label: "Aguardando" },
  { value: "pendente", label: "Pendente" },
  { value: "realizado", label: "Realizado" },
  { value: "cancelado", label: "Cancelado" },
];

export const reasonLabel = (r: string) =>
  REGISTRATION_REASONS.find((x) => x.value === r)?.label || r;
export const statusLabel = (s: string) =>
  REGISTRATION_STATUSES.find((x) => x.value === s)?.label || s;

export function statusClasses(status: string) {
  switch (status) {
    case "aguardando":
      return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
    case "pendente":
      return "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30";
    case "realizado":
      return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
    case "cancelado":
      return "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

interface ListOptions {
  from?: string; // ISO date YYYY-MM-DD
  to?: string;
}

export function useRegistrations(opts: ListOptions = {}) {
  return useQuery({
    queryKey: ["registrations", opts.from, opts.to],
    queryFn: async (): Promise<ClientRegistration[]> => {
      const PAGE_SIZE = 1000;
      let rows: any[] = [];
      let offset = 0;
      let hasMore = true;
      while (hasMore) {
        let q = supabase
          .from("client_registrations")
          .select("*")
          .order("created_at", { ascending: false })
          .range(offset, offset + PAGE_SIZE - 1);
        if (opts.from) q = q.gte("created_at", `${opts.from}T00:00:00`);
        if (opts.to) q = q.lte("created_at", `${opts.to}T23:59:59`);
        const { data, error } = await q;
        if (error) throw error;
        const batch = data || [];
        rows = rows.concat(batch);
        hasMore = batch.length === PAGE_SIZE;
        offset += PAGE_SIZE;
      }
      return rows as ClientRegistration[];
    },
  });
}

export function useRegistrationsWithAttachments() {
  return useQuery({
    queryKey: ["registrations-with-attachments"],
    queryFn: async (): Promise<Set<string>> => {
      const PAGE_SIZE = 1000;
      let rows: any[] = [];
      let offset = 0;
      let hasMore = true;
      while (hasMore) {
        const { data, error } = await supabase
          .from("client_registration_attachments")
          .select("registration_id")
          .range(offset, offset + PAGE_SIZE - 1);
        if (error) throw error;
        const batch = data || [];
        rows = rows.concat(batch);
        hasMore = batch.length === PAGE_SIZE;
        offset += PAGE_SIZE;
      }
      return new Set(rows.map((r) => r.registration_id));
    },
  });
}

export function useRegistrationAttachments(registrationId: string | null) {
  return useQuery({
    queryKey: ["registration-attachments", registrationId],
    enabled: !!registrationId,
    queryFn: async (): Promise<RegistrationAttachment[]> => {
      const { data, error } = await supabase
        .from("client_registration_attachments")
        .select("*")
        .eq("registration_id", registrationId!)
        .order("uploaded_at", { ascending: true });
      if (error) throw error;
      return (data || []) as RegistrationAttachment[];
    },
  });
}

export function useRegistrationEvents(registrationId: string | null) {
  return useQuery({
    queryKey: ["registration-events", registrationId],
    enabled: !!registrationId,
    queryFn: async (): Promise<RegistrationEvent[]> => {
      const { data, error } = await supabase
        .from("client_registration_events")
        .select("*")
        .eq("registration_id", registrationId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data || []) as RegistrationEvent[];
    },
  });
}

export function useSaveRegistration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<ClientRegistration> & { id?: string }) => {
      const { id, ...data } = payload;
      if (id) {
        const { error } = await supabase.from("client_registrations").update(data).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("client_registrations").insert(data as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["registrations"] });
      toast.success("Cadastro salvo");
    },
    onError: (e: any) => toast.error(e.message || "Erro ao salvar cadastro"),
  });
}

export function useUpdateRegistrationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; status: RegistrationStatus }) => {
      const { error } = await supabase
        .from("client_registrations")
        .update({ status: input.status })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["registrations"] });
      qc.invalidateQueries({ queryKey: ["registration-events", vars.id] });
      toast.success("Situação atualizada");
    },
    onError: (e: any) => toast.error(e.message || "Erro ao atualizar"),
  });
}

export function useDeleteRegistration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("client_registrations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["registrations"] });
      toast.success("Cadastro excluído");
    },
    onError: (e: any) => toast.error(e.message || "Erro ao excluir"),
  });
}

export function useAddAttachment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      registration_id: string;
      file_url: string;
      uploaded_by: string;
      uploaded_by_name: string;
    }) => {
      const { error } = await supabase.from("client_registration_attachments").insert(input);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["registration-attachments", vars.registration_id] });
    },
    onError: (e: any) => toast.error(e.message || "Erro ao anexar print"),
  });
}

export function useDeleteAttachment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; registration_id: string }) => {
      const { error } = await supabase
        .from("client_registration_attachments")
        .delete()
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["registration-attachments", vars.registration_id] });
    },
    onError: (e: any) => toast.error(e.message || "Erro ao remover print"),
  });
}

export function useSalespeople() {
  return useQuery({
    queryKey: ["profiles-simple"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, role")
        .order("name");
      if (error) throw error;
      return data || [];
    },
  });
}
