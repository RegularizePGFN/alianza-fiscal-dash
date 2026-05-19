import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { UserRole } from "@/lib/types";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Tone = "created" | "done" | "soft";

/**
 * Plays a short synthetic chime via Web Audio API.
 * Avoids needing external MP3 assets.
 */
function playChime(tone: Tone) {
  try {
    const AudioCtx =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const notes: Record<Tone, number[]> = {
      created: [660, 880], // neutral two-tone alert
      done: [784, 988, 1318], // positive ascending C major-ish
      soft: [520], // single soft beep
    };

    const freqs = notes[tone];
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + 0.12 * freqs.length + 0.1
    );
    gain.connect(ctx.destination);

    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = f;
      osc.connect(gain);
      const start = now + i * 0.11;
      osc.start(start);
      osc.stop(start + 0.18);
    });

    setTimeout(() => ctx.close().catch(() => {}), 1500);
  } catch {
    /* ignore */
  }
}

export function useRegistrationsRealtimeSound() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const lastEventRef = useRef<string>("");

  useEffect(() => {
    if (!user?.id) return;
    const role = user.role;

    const channel = supabase
      .channel("registrations-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "client_registrations" },
        (payload) => {
          const row: any = payload.new;
          if (!row) return;
          // Backoffice/admin (and not the creator) get notified
          if (
            (role === UserRole.ADMIN || role === UserRole.BACKOFFICE) &&
            row.salesperson_id !== user.id
          ) {
            const key = `ins-${row.id}`;
            if (lastEventRef.current === key) return;
            lastEventRef.current = key;
            playChime("created");
            toast.info(
              `Novo cadastro de ${row.salesperson_name || "vendedor"}`,
              {
                description: row.client_name || "Cliente sem nome",
                action: {
                  label: "Ver",
                  onClick: () => navigate("/cadastros"),
                },
              }
            );
            qc.invalidateQueries({ queryKey: ["registrations"] });
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "client_registrations" },
        (payload) => {
          const oldRow: any = payload.old;
          const newRow: any = payload.new;
          if (!newRow || !oldRow) return;
          if (oldRow.status === newRow.status) return;
          if (newRow.salesperson_id !== user.id) {
            qc.invalidateQueries({ queryKey: ["registrations"] });
            return;
          }

          const key = `upd-${newRow.id}-${newRow.status}`;
          if (lastEventRef.current === key) return;
          lastEventRef.current = key;

          const clientName = newRow.client_name || "cliente";
          if (newRow.status === "realizado") {
            playChime("done");
            toast.success(`Seu cadastro de ${clientName} foi concluído`, {
              action: {
                label: "Ver",
                onClick: () => navigate("/cadastros"),
              },
            });
          } else if (newRow.status === "pendente") {
            playChime("soft");
            toast.warning(`Cadastro de ${clientName} está pendente`, {
              description: newRow.notes || undefined,
              action: { label: "Ver", onClick: () => navigate("/cadastros") },
            });
          } else if (newRow.status === "cancelado") {
            playChime("soft");
            toast.error(`Cadastro de ${clientName} foi cancelado`, {
              description: newRow.notes || undefined,
              action: { label: "Ver", onClick: () => navigate("/cadastros") },
            });
          }

          qc.invalidateQueries({ queryKey: ["registrations"] });
          qc.invalidateQueries({ queryKey: ["notifications"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, user?.role, navigate, qc]);
}
