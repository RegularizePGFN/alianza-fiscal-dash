import { User, ArrowLeft, Trophy, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NotificationsPopover } from "@/components/notifications/NotificationsPopover";
import { MotivationalRankingDialog } from "@/components/ranking/MotivationalRankingDialog";
import { useAuth } from "@/contexts/auth";
import { useMotivationalSettings } from "@/hooks/useMotivationalSettings";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useMotivationalRanking, getWeekPeriod, RankingEntry } from "@/hooks/useMotivationalRanking";
import { cn } from "@/lib/utils";
import { Loader2, AlertCircle } from "lucide-react";

function PositionBadge({ position }: { position: number }) {
  if (position === 1) return <span className="text-2xl">🥇</span>;
  if (position === 2) return <span className="text-2xl">🥈</span>;
  if (position === 3) return <span className="text-2xl">🥉</span>;
  return <span className="text-lg font-bold text-muted-foreground">{position}º</span>;
}

function RankingTable({ 
  entries, 
  type, 
  currentUserId,
  displayTopCount 
}: { 
  entries: RankingEntry[]; 
  type: "volume" | "amount";
  currentUserId?: string;
  displayTopCount: number;
}) {
  const sortedEntries = [...entries]
    .sort((a, b) => {
      if (type === "volume") return a.volume_position - b.volume_position;
      return a.amount_position - b.amount_position;
    })
    .slice(0, displayTopCount > 0 ? displayTopCount : undefined);

  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
        {type === "volume" ? "📊 Por Volume de Contratos" : "💰 Por Faturamento"}
      </h4>
      <div className="space-y-1">
        {sortedEntries.map((entry) => {
          const position = type === "volume" ? entry.volume_position : entry.amount_position;
          const isCurrentUser = entry.salesperson_id === currentUserId;
          
          return (
            <div
              key={`${type}-${entry.salesperson_id}`}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg transition-colors",
                isCurrentUser 
                  ? "bg-primary/10 border border-primary/20" 
                  : "bg-muted/50 hover:bg-muted"
              )}
            >
              <div className="flex items-center gap-3">
                <PositionBadge position={position} />
                <span className={cn("font-medium", isCurrentUser && "text-primary")}>
                  {entry.salesperson_name}
                  {isCurrentUser && <span className="ml-2 text-xs">(você)</span>}
                </span>
              </div>
              <div className="text-right">
                {type === "volume" ? (
                  <span className="font-bold">{entry.contracts_count} contratos</span>
                ) : (
                  <span className="font-bold">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(entry.total_amount)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MotivationalRankingButton() {
  const { data: settings, isLoading } = useMotivationalSettings();
  const { data: ranking, isLoading: rankingLoading, error: rankingError } = useMotivationalRanking();
  const { user } = useAuth();
  const weekPeriod = getWeekPeriod();

  // Don't show if inactive or loading
  if (isLoading || !settings?.is_active) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.button
          className="relative flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 bg-[length:200%_100%] shadow-lg shadow-amber-500/30 border border-amber-400/50 hover:shadow-amber-500/50 transition-shadow cursor-pointer"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            opacity: { duration: 0.3 },
            scale: { duration: 0.3 },
            backgroundPosition: {
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Glow effect */}
          <motion.div 
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 blur-md opacity-50 -z-10"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          <Trophy className="h-5 w-5" />
          <span className="hidden sm:inline">Ranking Motivacional</span>
          <Sparkles className="h-4 w-4 animate-pulse" />
        </motion.button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Trophy className="h-6 w-6 text-amber-500" />
            Ranking Motivacional
          </DialogTitle>
          <DialogDescription>
            Semana: {weekPeriod.start} a {weekPeriod.end}
          </DialogDescription>
        </DialogHeader>

        {/* Prize Image */}
        {settings?.prize_image_url && (
          <div className="rounded-lg overflow-hidden">
            <img 
              src={settings.prize_image_url} 
              alt="Prêmio" 
              className="w-full h-auto object-cover"
              style={{ maxHeight: "150px" }}
            />
          </div>
        )}

        {/* Prize Banner */}
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-amber-600 dark:text-amber-400 font-semibold">🎯 Prêmio da Semana</span>
          </div>
          <p className="text-lg font-bold">{settings?.prize_title || "Prêmio Motivacional"}</p>
          {settings?.prize_description && (
            <p className="text-sm text-muted-foreground mt-1">{settings.prize_description}</p>
          )}
        </div>

        {rankingLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {rankingError && (
          <div className="flex items-center gap-2 text-destructive py-4">
            <AlertCircle className="h-5 w-5" />
            <span>Erro ao carregar ranking. Tente novamente.</span>
          </div>
        )}

        {ranking && ranking.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Nenhuma venda registrada esta semana.</p>
            <p className="text-sm">Seja o primeiro a aparecer no ranking!</p>
          </div>
        )}

        {ranking && ranking.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <div className="flex-1">
              <RankingTable entries={ranking} type="volume" currentUserId={user?.id} displayTopCount={settings?.display_top_count ?? 5} />
            </div>
            
            {/* Vertical divider for desktop */}
            <div className="hidden sm:block w-px bg-border" />
            
            {/* Horizontal divider for mobile */}
            <div className="sm:hidden h-px bg-border" />
            
            <div className="flex-1">
              <RankingTable entries={ranking} type="amount" currentUserId={user?.id} displayTopCount={settings?.display_top_count ?? 5} />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function AppHeader() {
  const { user, isImpersonating, stopImpersonating } = useAuth();
  const { toast } = useToast();
  const [isReturningToOriginal, setIsReturningToOriginal] = useState(false);
  
  const handleReturnToOriginalUser = async () => {
    setIsReturningToOriginal(true);
    try {
      const success = await stopImpersonating();
      if (success) {
        toast({
          title: "Sucesso",
          description: "Você retornou à sua conta original",
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível retornar à sua conta original",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao retornar à sua conta",
        variant: "destructive",
      });
    } finally {
      setIsReturningToOriginal(false);
    }
  };
  
  return (
    <motion.header 
      className="sticky top-0 z-50 h-16 flex items-center gap-4 border-b bg-gradient-to-r from-header to-header/95 backdrop-blur-sm px-4 md:px-6 dark:border-gray-800 dark:from-gray-900/90 dark:to-gray-900/80 app-header shadow-sm"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* User greeting aligned to the left */}
      <motion.div 
        className="flex-1"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {user && (
          <span className="font-medium text-foreground">
            Olá {user.name || user.email?.split('@')[0] || ''}
          </span>
        )}
      </motion.div>

      {/* Centered motivational ranking button */}
      <div className="flex-1 flex justify-center">
        <MotivationalRankingButton />
      </div>
      
      <motion.div 
        className="flex-1 flex items-center justify-end gap-3"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {isImpersonating && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              variant="outline" 
              onClick={handleReturnToOriginalUser}
              disabled={isReturningToOriginal}
              size="sm"
              className="text-xs border-border/40 hover:border-border bg-background/50 backdrop-blur-sm"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              Voltar à sua conta
            </Button>
          </motion.div>
        )}

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ThemeToggle />
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <NotificationsPopover />
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link 
            to="/perfil" 
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 hover:from-muted hover:to-muted/70 border border-border/40 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <span className="sr-only">Perfil</span>
            <User className="h-4 w-4" />
          </Link>
        </motion.div>
      </motion.div>
    </motion.header>
  );
}
