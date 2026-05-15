import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PaymentMethod, UserRole } from "@/lib/types";
import { convertToPaymentMethod } from "@/hooks/sales/saleUtils";

export interface SalesReportRow {
  id: string;
  userId: string;
  userName: string;
  clientName: string;
  clientPhone: string | null;
  clientDocument: string | null;
  grossAmount: number;
  paymentMethod: PaymentMethod;
  installments: number;
  saleDate: string; // YYYY-MM-DD
  createdAt: string | null;
}

interface Options {
  enabled: boolean;
  from: Date;
  to: Date; // exclusive end
  user: { id: string; role?: UserRole } | null;
}

const toDateStr = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export function useSalesReport(opts: Options) {
  const fromStr = toDateStr(opts.from);
  // exclusive end -> subtract 1 day for inclusive end
  const inclusiveEnd = new Date(opts.to.getTime() - 1);
  const toStr = toDateStr(inclusiveEnd);

  return useQuery({
    queryKey: ["sales-report", fromStr, toStr, opts.user?.id, opts.user?.role],
    enabled: opts.enabled && !!opts.user,
    staleTime: 30_000,
    queryFn: async (): Promise<SalesReportRow[]> => {
      const PAGE_SIZE = 1000;
      let rows: any[] = [];
      let offset = 0;
      let hasMore = true;

      while (hasMore) {
        let q = supabase
          .from("sales")
          .select("*")
          .gte("sale_date", fromStr)
          .lte("sale_date", toStr)
          .order("sale_date", { ascending: false })
          .order("created_at", { ascending: false })
          .range(offset, offset + PAGE_SIZE - 1);

        if (opts.user?.role === UserRole.SALESPERSON) {
          q = q.eq("salesperson_id", opts.user.id);
        }

        const { data, error } = await q;
        if (error) throw error;
        const batch = data || [];
        rows = rows.concat(batch);
        hasMore = batch.length === PAGE_SIZE;
        offset += PAGE_SIZE;
      }

      return rows.map((r): SalesReportRow => ({
        id: r.id,
        userId: r.salesperson_id,
        userName: r.salesperson_name || "Desconhecido",
        clientName: r.client_name || "Cliente",
        clientPhone: r.client_phone || null,
        clientDocument: r.client_document || null,
        grossAmount: Number(r.gross_amount) || 0,
        paymentMethod: convertToPaymentMethod(r.payment_method),
        installments: Number(r.installments) || 1,
        saleDate: r.sale_date,
        createdAt: r.created_at || null,
      }));
    },
  });
}
