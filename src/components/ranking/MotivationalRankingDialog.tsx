import { Trophy, Medal, Award, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMotivationalRanking, getWeekPeriod, RankingEntry } from "@/hooks/useMotivationalRanking";
import { useMotivationalSettings } from "@/hooks/useMotivationalSettings";
import { useAuth } from "@/contexts/auth";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";

function PositionBadge({ position }: { position: number }) {
  if (position === 1) {
    return <span className="text-xl">🥇</span>;
  }
  if (position === 2) {
    return <span className="text-xl">🥈</span>;
  }
  if (position === 3) {
    return <span className="text-xl">🥉</span>;
  }
  return <span className="text-sm font-medium text-muted-foreground w-6 text-center">{position}º</span>;
}

function RankingTable({
  title,
  icon: Icon,
  data,
  type,
  currentUserId,
  displayTopCount,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  data: RankingEntry[];
  type: "volume" | "amount";
  currentUserId?: string;
  displayTopCount: number;
}) {
  const sortedData = [...data]
    .sort((a, b) => {
      if (type === "volume") {
        return a.volume_position - b.volume_position;
      }
      return a.amount_position - b.amount_position;
    })
    .slice(0, displayTopCount > 0 ? displayTopCount : undefined);

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      <div className="space-y-2">
        {sortedData.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma venda esta semana
          </p>
        ) : (
          sortedData.map((entry, index) => {
            const position = type === "volume" ? entry.volume_position : entry.amount_position;
            const isCurrentUser = entry.salesperson_id === currentUserId;
            
            return (
              <motion.div
                key={entry.salesperson_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-3 p-2 rounded-lg ${
                  isCurrentUser
                    ? "bg-primary/10 border border-primary/30"
                    : "bg-muted/30"
                }`}
              >
                <PositionBadge position={position} />
                <span className={`flex-1 truncate text-sm ${isCurrentUser ? "font-medium" : ""}`}>
                  {entry.salesperson_name}
                  {isCurrentUser && <span className="text-xs text-primary ml-1">(você)</span>}
                </span>
                <span className="font-medium text-sm tabular-nums">
                  {type === "volume"
                    ? `${entry.contracts_count} contrato${entry.contracts_count !== 1 ? "s" : ""}`
                    : formatCurrency(entry.total_amount)}
                </span>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

export function MotivationalRankingDialog() {
  const { data: ranking, isLoading, error } = useMotivationalRanking();
  const { data: settings } = useMotivationalSettings();
  const { user } = useAuth();
  const weekPeriod = getWeekPeriod();
  const displayTopCount = settings?.display_top_count ?? 5;

  return (
    <Dialog>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 hover:from-muted hover:to-muted/70 border border-border/40 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Trophy className="h-4 w-4 text-amber-500" />
                <span className="sr-only">Ranking Motivacional</span>
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Ranking Motivacional</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Ranking Motivacional
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Descrição do prêmio */}
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-lg p-4">
            <p className="text-sm text-center">
              <span className="font-semibold">🎉 Prêmio:</span> Almoço individual na{" "}
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                Churrascaria Tropeiro
              </span>
            </p>
            <p className="text-xs text-muted-foreground text-center mt-1">
              2 ganhadores: maior volume + maior faturamento
            </p>
          </div>

          {/* Rankings */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <p className="text-sm text-destructive text-center py-4">
              Erro ao carregar ranking
            </p>
          ) : (
            <div className="flex flex-col sm:flex-row gap-6">
              <RankingTable
                title="Volume (Contratos)"
                icon={Medal}
                data={ranking || []}
                type="volume"
                currentUserId={user?.id}
                displayTopCount={displayTopCount}
              />
              <RankingTable
                title="Faturamento (R$)"
                icon={Award}
                data={ranking || []}
                type="amount"
                currentUserId={user?.id}
                displayTopCount={displayTopCount}
              />
            </div>
          )}

          {/* Período */}
          <div className="text-center text-xs text-muted-foreground border-t pt-3">
            Semana: {weekPeriod.start} - {weekPeriod.end}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
