import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTodayProposals } from "./useTodayProposals";
import { TodayProposalsTable } from "./TodayProposalsTable";
import { TodayProposalsCharts } from "./TodayProposalsCharts";
import { exportTodayProposalsToExcel } from "./exportTodayProposals";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TodayProposalsDialog({ open, onOpenChange }: Props) {
  const { data, isLoading } = useTodayProposals(open);
  const proposals = data ?? [];
  const todayLabel = format(new Date(), "dd/MM/yyyy", { locale: ptBR });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] max-w-[1400px] max-h-[92vh] overflow-y-auto overflow-x-hidden p-4 sm:p-6">
        <DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-3 pr-8">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-primary/10 p-2 text-primary">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-base">Propostas Geradas Hoje</DialogTitle>
                <div className="mt-0.5 flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">
                    {todayLabel}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {proposals.length} {proposals.length === 1 ? "proposta" : "propostas"}
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportTodayProposalsToExcel(proposals)}
              disabled={isLoading || proposals.length === 0}
              className="gap-2"
            >
              <Download className="h-3.5 w-3.5" />
              Exportar Excel
            </Button>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="grid gap-4 lg:grid-cols-5">
            <div className="lg:col-span-3 space-y-2">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
            <div className="lg:col-span-2 space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <TodayProposalsTable data={proposals} />
            </div>
            <div className="lg:col-span-2">
              <TodayProposalsCharts data={proposals} />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
