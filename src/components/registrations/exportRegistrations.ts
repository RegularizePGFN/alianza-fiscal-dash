import * as XLSX from "xlsx";
import {
  ClientRegistration,
  reasonLabel,
  statusLabel,
} from "@/hooks/useRegistrations";
import { format } from "date-fns";
import { formatCnpj, formatCpf } from "@/lib/formatters/document";

export function exportRegistrationsToExcel(rows: ClientRegistration[]) {
  const data = rows.map((r) => ({
    Vendedor: r.salesperson_name,
    Cliente: r.client_name,
    Telefone: r.client_phone || "",
    CNPJ: r.cnpj ? formatCnpj(r.cnpj) : "",
    CPF: r.cpf ? formatCpf(r.cpf) : "",
    Motivo: reasonLabel(r.reason),
    Situação: statusLabel(r.status),
    Backoffice: r.backoffice_name || "",
    "Criado em": format(new Date(r.created_at), "dd/MM/yyyy HH:mm"),
    "Atendido em": r.completed_at
      ? format(new Date(r.completed_at), "dd/MM/yyyy HH:mm")
      : "",
    Observação: r.notes || "",
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Cadastros");
  XLSX.writeFile(wb, `cadastros_${format(new Date(), "yyyy-MM-dd_HHmm")}.xlsx`);
}
