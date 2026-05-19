import { useMemo, useState } from "react";
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

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [reason, setReason] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ClientRegistration | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<ClientRegistration | null>(null);

  const [toDelete, setToDelete] = useState<ClientRegistration | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (reason !== "all" && r.reason !== reason) return false;
      if (!q) return true;
      return [r.client_name, r.cnpj, r.cpf, r.client_phone, r.salesperson_name]
        .some((v) => v && v.toLowerCase().includes(q));
    });
  }, [items, search, status, reason]);

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
        canManage={canManage}
      />

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">Lista</TabsTrigger>
          <TabsTrigger value="charts">Análise</TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="pt-4">
          <RegistrationsTable
            items={filtered}
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
