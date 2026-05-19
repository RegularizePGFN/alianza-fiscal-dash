import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * Toca um som tipo "moedinha" (caixa registradora) via Web Audio API.
 * Dois "tilins" rápidos, sem precisar de MP3 externo.
 */
function playCoinChime() {
  try {
    const AudioCtx =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Duas notas brilhantes em sequência ("ti-tim")
    const notes: { freq: number; start: number; dur: number }[] = [
      { freq: 1318.5, start: 0, dur: 0.18 }, // E6
      { freq: 1760.0, start: 0.09, dur: 0.22 }, // A6
    ];

    notes.forEach(({ freq, start, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;

      const t0 = now + start;
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(0.25, t0 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    });

    setTimeout(() => ctx.close().catch(() => {}), 1200);
  } catch {
    /* ignore */
  }
}

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function useSalesRealtimeSound() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const lastEventRef = useRef<string>("");

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel("sales-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "sales" },
        (payload) => {
          const row: any = payload.new;
          if (!row) return;

          const key = `sale-${row.id}`;
          if (lastEventRef.current === key) return;
          lastEventRef.current = key;

          playCoinChime();

          const amount = Number(row.gross_amount) || 0;
          const who = row.salesperson_name || "vendedor";
          toast.success(`Nova venda — ${BRL.format(amount)}`, {
            description: `Registrada por ${who}`,
          });

          qc.invalidateQueries({ queryKey: ["sales"] });
          qc.invalidateQueries({ queryKey: ["dashboard"] });
          qc.invalidateQueries({ queryKey: ["team-daily-sales"] });
          qc.invalidateQueries({ queryKey: ["commissions"] });
          qc.invalidateQueries({ queryKey: ["motivational-ranking"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, qc]);
}
