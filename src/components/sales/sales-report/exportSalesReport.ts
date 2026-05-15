import { utils, write } from "xlsx";
import { format } from "date-fns";
import type { SalesReportRow } from "./useSalesReport";

const formatDoc = (doc: string | null) => doc || "";
const formatPhone = (phone: string | null) => {
  if (!phone) return "";
  const d = phone.replace(/\D/g, "");
  if (d.length === 11) return d.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  if (d.length === 10) return d.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  return phone;
};

interface ExportRange {
  from: Date;
  to: Date;
}

export function exportSalesReportToExcel(rows: SalesReportRow[], range?: ExportRange) {
  let fileLabel: string;
  if (range) {
    const startLabel = format(range.from, "yyyy-MM-dd");
    const inclusiveEnd = new Date(range.to.getTime() - 1);
    const endLabel = format(inclusiveEnd, "yyyy-MM-dd");
    fileLabel = startLabel === endLabel ? startLabel : `${startLabel}_a_${endLabel}`;
  } else {
    fileLabel = format(new Date(), "yyyy-MM-dd");
  }

  const data = rows.map((r) => ({
    Data: r.saleDate,
    Vendedor: r.userName,
    Cliente: r.clientName,
    Documento: formatDoc(r.clientDocument),
    Telefone: formatPhone(r.clientPhone),
    "Forma de Pagamento": r.paymentMethod,
    Parcelas: r.installments,
    "Valor Bruto": r.grossAmount,
  }));

  const ws = utils.json_to_sheet(data);
  ws["!cols"] = [
    { wch: 12 }, { wch: 24 }, { wch: 32 }, { wch: 18 },
    { wch: 16 }, { wch: 18 }, { wch: 10 }, { wch: 16 },
  ];
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "Vendas");

  const buf = write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `vendas-${fileLabel}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
