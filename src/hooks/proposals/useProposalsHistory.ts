import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { UserRole } from '@/lib/types';
import { Proposal } from '@/lib/types/proposals';

export interface HistoryKpis {
  total_count: number;
  total_consolidated: number;
  total_discounted: number;
  total_fees: number;
  avg_discount: number;
}

export interface HistoryDailyPoint {
  date: string;
  count: number;
  fees: number;
}

export interface HistoryBySeller {
  user_id: string;
  name: string;
  count: number;
  fees: number;
  consolidated: number;
}

export interface HistorySummary {
  kpis: HistoryKpis;
  daily: HistoryDailyPoint[];
  by_seller: HistoryBySeller[];
  sees_all: boolean;
}

interface UseHistoryOpts {
  from: Date;
  to: Date; // exclusive
  sellerId?: string | null;
  page: number;
  pageSize: number;
  search?: string;
  enabled?: boolean;
}

function formatDateBR(date: string) {
  try {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return date;
  }
}

export function useProposalsHistorySummary({ from, to, sellerId, enabled = true }: Omit<UseHistoryOpts, 'page' | 'pageSize' | 'search'>) {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;
  const effectiveSeller = isAdmin ? sellerId ?? null : user?.id ?? null;

  return useQuery({
    queryKey: ['proposals-history-summary', from.toISOString(), to.toISOString(), effectiveSeller],
    enabled: enabled && !!user,
    staleTime: 30_000,
    refetchInterval: 60_000,
    queryFn: async (): Promise<HistorySummary> => {
      const { data, error } = await supabase.rpc('get_proposals_history_summary', {
        p_from: from.toISOString(),
        p_to: to.toISOString(),
        p_user_id: effectiveSeller,
      });
      if (error) throw error;
      const payload = (data ?? {}) as any;
      return {
        kpis: payload.kpis ?? {
          total_count: 0,
          total_consolidated: 0,
          total_discounted: 0,
          total_fees: 0,
          avg_discount: 0,
        },
        daily: payload.daily ?? [],
        by_seller: payload.by_seller ?? [],
        sees_all: !!payload.sees_all,
      };
    },
  });
}

export function useProposalsHistoryList({
  from,
  to,
  sellerId,
  page,
  pageSize,
  search,
  enabled = true,
}: UseHistoryOpts) {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;
  const effectiveSeller = isAdmin ? sellerId ?? null : user?.id ?? null;

  return useQuery({
    queryKey: [
      'proposals-history-list',
      from.toISOString(),
      to.toISOString(),
      effectiveSeller,
      page,
      pageSize,
      search ?? '',
    ],
    enabled: enabled && !!user,
    staleTime: 30_000,
    queryFn: async () => {
      const offset = (page - 1) * pageSize;
      let query = supabase
        .from('proposals')
        .select(
          'id, user_id, created_at, client_name, cnpj, total_debt, discounted_value, discount_percentage, fees_value, entry_value, entry_installments, installments, installment_value, debt_number, client_email, client_phone, business_activity, image_url, creation_date, validity_date',
          { count: 'exact' }
        )
        .gte('created_at', from.toISOString())
        .lt('created_at', to.toISOString())
        .order('created_at', { ascending: false });

      if (effectiveSeller) query = query.eq('user_id', effectiveSeller);

      if (search && search.trim()) {
        const s = `%${search.trim()}%`;
        query = query.or(`client_name.ilike.${s},cnpj.ilike.${s},debt_number.ilike.${s}`);
      }

      query = query.range(offset, offset + pageSize - 1);

      const { data, error, count } = await query;
      if (error) throw error;

      const rows = data || [];
      const userIds = Array.from(new Set(rows.map((r) => r.user_id).filter(Boolean)));
      let userMap: Record<string, string> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', userIds as string[]);
        userMap = (profiles || []).reduce((acc, p) => {
          acc[p.id] = p.name;
          return acc;
        }, {} as Record<string, string>);
      }

      const items: Proposal[] = rows.map((item: any) => {
        let feesValue = item.fees_value;
        if (item.total_debt && item.discounted_value && !feesValue) {
          feesValue = (Number(item.total_debt) - Number(item.discounted_value)) * 0.2;
        }
        return {
          id: item.id,
          userId: item.user_id,
          userName: userMap[item.user_id] || 'Desconhecido',
          createdAt: item.created_at,
          creationDate: item.creation_date,
          validityDate: item.validity_date,
          data: {
            cnpj: item.cnpj,
            totalDebt:
              Number(item.total_debt)?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) ||
              '0,00',
            discountedValue:
              Number(item.discounted_value)?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) ||
              '0,00',
            discountPercentage:
              Number(item.discount_percentage)?.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
              }) || '0,00',
            entryValue:
              Number(item.entry_value)?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) ||
              '0,00',
            entryInstallments: item.entry_installments?.toString() || '1',
            installments: item.installments?.toString() || '0',
            installmentValue:
              Number(item.installment_value)?.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
              }) || '0,00',
            debtNumber: item.debt_number || '',
            feesValue:
              Number(feesValue)?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00',
            clientName: item.client_name || 'Cliente não informado',
            clientEmail: item.client_email,
            clientPhone: item.client_phone,
            businessActivity: item.business_activity,
            creationDate: item.creation_date ? formatDateBR(item.creation_date) : undefined,
            validityDate: item.validity_date ? formatDateBR(item.validity_date) : undefined,
          },
          imageUrl: item.image_url || '',
        };
      });

      return { items, total: count ?? 0 };
    },
  });
}

export function useSellersList(enabled: boolean) {
  return useQuery({
    queryKey: ['profiles-vendedores'],
    enabled,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, role')
        .order('name');
      if (error) throw error;
      return (data || []).filter((p: any) => p.role === 'vendedor');
    },
  });
}

export async function deleteProposalById(id: string) {
  const { error } = await supabase.from('proposals').delete().eq('id', id);
  if (error) throw error;
}
