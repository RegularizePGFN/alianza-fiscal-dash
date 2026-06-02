import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Download, Search, RotateCw } from "lucide-react";
import {
  AUTOMATION_STATUSES,
  REGISTRATION_REASONS,
  REGISTRATION_STATUSES,
} from "@/hooks/useRegistrations";

interface Props {
  search: string;
  onSearch: (v: string) => void;
  status: string;
  onStatus: (v: string) => void;
  reason: string;
  onReason: (v: string) => void;
  automation: string;
  onAutomation: (v: string) => void;
  periodFrom: string;
  periodTo: string;
  onPeriodChange: (from: string, to: string) => void;
  onNew: () => void;
  onExport: () => void;
  onForceResend: () => void;
  forceResendDisabled?: boolean;
  forceResendCount?: number;
  canManage: boolean;
}

export function RegistrationsFilters({
  search,
  onSearch,
  status,
  onStatus,
  reason,
  onReason,
  automation,
  onAutomation,
  periodFrom,
  periodTo,
  onPeriodChange,
  onNew,
  onExport,
  onForceResend,
  forceResendDisabled,
  forceResendCount = 0,
  canManage,
}: Props) {
  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="relative flex-1 min-w-[220px]">
        <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-8"
          placeholder="Buscar por cliente, CNPJ, CPF, telefone..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      <div className="w-[150px]">
        <Input
          type="date"
          value={periodFrom}
          onChange={(e) => onPeriodChange(e.target.value, periodTo)}
        />
      </div>
      <div className="w-[150px]">
        <Input
          type="date"
          value={periodTo}
          onChange={(e) => onPeriodChange(periodFrom, e.target.value)}
        />
      </div>
      <div className="w-[160px]">
        <Select value={status} onValueChange={onStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Situação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas situações</SelectItem>
            {REGISTRATION_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-[170px]">
        <Select value={reason} onValueChange={onReason}>
          <SelectTrigger>
            <SelectValue placeholder="Motivo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos motivos</SelectItem>
            {REGISTRATION_REASONS.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-[180px]">
        <Select value={automation} onValueChange={onAutomation}>
          <SelectTrigger>
            <SelectValue placeholder="Automação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas automações</SelectItem>
            {AUTOMATION_STATUSES.map((a) => (
              <SelectItem key={a.value} value={a.value}>
                {a.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {canManage && (
        <Button
          variant="outline"
          onClick={onForceResend}
          disabled={forceResendDisabled}
          title="Reenvia todos os cadastros em Processando para a fila"
        >
          <RotateCw className="w-4 h-4 mr-2" />
          Forçar reenvio{forceResendCount > 0 ? ` (${forceResendCount})` : ""}
        </Button>
      )}
      <Button variant="outline" onClick={onExport}>
        <Download className="w-4 h-4 mr-2" /> Exportar
      </Button>
      <Button onClick={onNew}>
        <Plus className="w-4 h-4 mr-2" /> Novo cadastro
      </Button>
    </div>
  );
}
