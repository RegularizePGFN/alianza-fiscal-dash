import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RegistrationsKpiCards } from "./RegistrationsKpiCards";
import { RegistrationsFilters } from "./RegistrationsFilters";
import { RegistrationsTable } from "./RegistrationsTable";
import { RegistrationFormModal } from "./RegistrationFormModal";
import { RegistrationDetailDrawer } from "./RegistrationDetailDrawer";
import { RegistrationsCharts } from "./RegistrationsCharts";
import { DataPagination } from "@/components/ui/data-pagination";
import { exportRegistrationsToExcel } from "./exportRegistrations";
import {
  ClientRegistration,
  useDeleteRegistration,
  useRegistrations,
  useRegistrationsWithAttachments,
} from "@/hooks/useRegistrations";
import { useAutomationRetry } from "@/hooks/useAutomation";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/auth";
import { UserRole } from "@/lib/types";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export function RegistrationsContainer() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;
  const canManage = isAdmin || user?.role === UserRole.BACKOFFICE;

  const [periodFrom, setPeriodFrom] = useState(daysAgo(30));
  const [periodTo, setPeriodTo] = useState(todayStr());
  const { data: items = [], isLoading } = useRegistrations({
    from: periodFrom,
    to: periodTo,
  });
  const del = useDeleteRegistration();
  const { data: attachmentsSet = new Set<string>() } = useRegistrationsWithAttachments();
  const retry = useAutomationRetry();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [reason, setReason] = useState("all");
  const [automation, setAutomation] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setPage(1);
  }, [search, status, reason, automation, periodFrom, periodTo]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ClientRegistration | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<ClientRegistration | null>(null);

  const [toDelete, setToDelete] = useState<ClientRegistration | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((r) => {
      const isAutomation = r.processing_mode === "automatico" && !r.backoffice_name;
      if (status !== "all" && r.status !== status) return false;
      if (reason !== "all" && r.reason !== reason) return false;
      if (automation !== "all") {
        if (!isAutomation) return false;
        if (r.automation_status !== automation) return false;
      }
      if (!q) return true;
      return [r.client_name, r.cnpj, r.cpf, r.client_phone, r.salesperson_name]
        .some((v) => v && v.toLowerCase().includes(q));
    });
  }, [items, search, status, reason, automation]);

  const processingItems = useMemo(
    () =>
      items.filter(
        (r) =>
          r.processing_mode === "automatico" &&
          !r.backoffice_name &&
          r.automation_status === "processing"
      ),
    [items]
  );

  const handleForceResend = async () => {
    if (!processingItems.length) {
      toast.info("Nenhum cadastro em processamento");
      return;
    }
    const confirmed = window.confirm(
      `Reenviar ${processingItems.length} cadastro(s) em processamento para a fila?`
    );
    if (!confirmed) return;
    try {
      await Promise.all(processingItems.map((r) => retry.mutateAsync(r.id)));
      toast.success(`${processingItems.length} cadastro(s) reenviado(s)`);
    } catch (e: any) {
      toast.error(e?.message || "Erro ao reenviar");
    }
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  const handleGenerateSimulation = (r: ClientRegistration) => {
    navigate(`/propostas?cadastroId=${r.id}`);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Cadastros</h1>
        <p className="text-sm text-muted-foreground">
          Substitui a planilha do Regularize. Crie, acompanhe e gere a simulação direto.
        </p>
      </div>

      <RegistrationsKpiCards items={filtered} />

      <RegistrationsFilters
        search={search}
        onSearch={setSearch}
        status={status}
        onStatus={setStatus}
        reason={reason}
        onReason={setReason}
        automation={automation}
        onAutomation={setAutomation}
        periodFrom={periodFrom}
        periodTo={periodTo}
        onPeriodChange={(f, t) => {
          setPeriodFrom(f);
          setPeriodTo(t);
        }}
        onNew={() => {
          setEditing(null);
          setFormOpen(true);
        }}
        onExport={() => exportRegistrationsToExcel(filtered)}
        onForceResend={handleForceResend}
        forceResendDisabled={retry.isPending || processingItems.length === 0}
        forceResendCount={processingItems.length}
        canManage={canManage}
      />

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">Lista</TabsTrigger>
          <TabsTrigger value="charts">Análise</TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="pt-4 space-y-4">
          <RegistrationsTable
            items={paginatedItems}
            loading={isLoading}
            canManage={canManage}
            isAdmin={isAdmin}
            currentUserId={user?.id}
            attachmentsSet={attachmentsSet}
            onOpen={(r) => {
              setDetail(r);
              setDetailOpen(true);
            }}
            onEdit={(r) => {
              setEditing(r);
              setFormOpen(true);
            }}
            onGenerateSimulation={handleGenerateSimulation}
            onDelete={(r) => setToDelete(r)}
          />
          {filtered.length > 0 && (
            <DataPagination
              currentPage={safePage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={filtered.length}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          )}
        </TabsContent>
        <TabsContent value="charts" className="pt-4">
          <RegistrationsCharts items={filtered} />
        </TabsContent>
      </Tabs>

      <RegistrationFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        item={editing}
      />

      <RegistrationDetailDrawer
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        item={detail}
        canManage={canManage}
        onGenerateSimulation={handleGenerateSimulation}
      />

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cadastro?</AlertDialogTitle>
            <AlertDialogDescription>
              {toDelete?.client_name}. Esta ação remove também todos os prints e histórico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (toDelete) await del.mutateAsync(toDelete.id);
                setToDelete(null);
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
