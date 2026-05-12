import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Equipment = {
  id: string;
  tag: string;
  name: string;
  type: string;
  brand: string | null;
  model: string | null;
  serial_number: string | null;
  imei: string | null;
  acquisition_date: string | null;
  acquisition_value: number | null;
  condition: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Assignment = {
  id: string;
  equipment_id: string;
  user_id: string;
  user_name: string;
  assigned_at: string;
  returned_at: string | null;
  condition_on_assign: string | null;
  condition_on_return: string | null;
  notes: string | null;
  created_at: string;
};

export type EquipmentWithAssignment = Equipment & {
  current_assignment: Assignment | null;
};

export function useEquipmentList() {
  return useQuery({
    queryKey: ["equipment-list"],
    queryFn: async (): Promise<EquipmentWithAssignment[]> => {
      const { data: equipment, error } = await supabase
        .from("equipment")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const { data: activeAssignments, error: aerr } = await supabase
        .from("equipment_assignments")
        .select("*")
        .is("returned_at", null);
      if (aerr) throw aerr;

      const map = new Map<string, Assignment>();
      (activeAssignments || []).forEach((a: any) => map.set(a.equipment_id, a));

      return (equipment || []).map((e: any) => ({
        ...e,
        current_assignment: map.get(e.id) || null,
      }));
    },
  });
}

export function useEquipmentHistory(equipmentId: string | null) {
  return useQuery({
    queryKey: ["equipment-history", equipmentId],
    enabled: !!equipmentId,
    queryFn: async (): Promise<Assignment[]> => {
      const { data, error } = await supabase
        .from("equipment_assignments")
        .select("*")
        .eq("equipment_id", equipmentId!)
        .order("assigned_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useUsersForAssignment() {
  return useQuery({
    queryKey: ["users-simple-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, email")
        .order("name");
      if (error) throw error;
      return data || [];
    },
  });
}

export function useSaveEquipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Equipment> & { id?: string }) => {
      const { id, ...data } = payload;
      // Remove tag if empty so trigger generates it
      if (!data.tag || !data.tag.trim()) delete (data as any).tag;
      if (id) {
        const { error } = await supabase.from("equipment").update(data).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("equipment").insert(data as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["equipment-list"] });
      toast.success("Equipamento salvo");
    },
    onError: (e: any) => toast.error(e.message || "Erro ao salvar"),
  });
}

export function useDeleteEquipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("equipment").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["equipment-list"] });
      toast.success("Equipamento excluído");
    },
    onError: (e: any) => toast.error(e.message || "Erro ao excluir"),
  });
}

export function useAssignEquipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      equipment_id: string;
      user_id: string;
      user_name: string;
      assigned_at: string;
      condition_on_assign?: string;
      notes?: string;
    }) => {
      const { error } = await supabase.from("equipment_assignments").insert(input);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["equipment-list"] });
      qc.invalidateQueries({ queryKey: ["equipment-history", vars.equipment_id] });
      toast.success("Equipamento atribuído");
    },
    onError: (e: any) => toast.error(e.message || "Erro ao atribuir"),
  });
}

export function useReturnEquipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      assignment_id: string;
      equipment_id: string;
      returned_at: string;
      condition_on_return?: string;
      notes?: string;
    }) => {
      const { error } = await supabase
        .from("equipment_assignments")
        .update({
          returned_at: input.returned_at,
          condition_on_return: input.condition_on_return,
          notes: input.notes,
        })
        .eq("id", input.assignment_id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["equipment-list"] });
      qc.invalidateQueries({ queryKey: ["equipment-history", vars.equipment_id] });
      toast.success("Devolução registrada");
    },
    onError: (e: any) => toast.error(e.message || "Erro ao devolver"),
  });
}

export const EQUIPMENT_TYPES = [
  { value: "notebook", label: "Notebook" },
  { value: "celular", label: "Celular" },
  { value: "monitor", label: "Monitor" },
  { value: "headset", label: "Headset" },
  { value: "tablet", label: "Tablet" },
  { value: "outros", label: "Outros" },
];

export const EQUIPMENT_CONDITIONS = [
  { value: "novo", label: "Novo" },
  { value: "bom", label: "Bom" },
  { value: "regular", label: "Regular" },
  { value: "danificado", label: "Danificado" },
];

export const EQUIPMENT_STATUSES = [
  { value: "disponivel", label: "Disponível" },
  { value: "em_uso", label: "Em uso" },
  { value: "manutencao", label: "Manutenção" },
  { value: "aposentado", label: "Aposentado" },
];

export function statusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "em_uso": return "default";
    case "disponivel": return "secondary";
    case "manutencao": return "outline";
    case "aposentado": return "destructive";
    default: return "secondary";
  }
}

export function statusLabel(s: string) {
  return EQUIPMENT_STATUSES.find(x => x.value === s)?.label || s;
}
export function typeLabel(t: string) {
  return EQUIPMENT_TYPES.find(x => x.value === t)?.label || t;
}
export function conditionLabel(c: string) {
  return EQUIPMENT_CONDITIONS.find(x => x.value === c)?.label || c;
}
