import { utils, write } from "xlsx";
import { format } from "date-fns";
import type { TodayProposal } from "./useTodayProposals";

const formatCnpj = (cnpj: string | null) => {
  if (!cnpj) return "";
  const d = cnpj.replace(/\D/g, "");
  if (d.length !== 14) return cnpj;
  return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
};

export function exportTodayProposalsToExcel(proposals: TodayProposal[]) {
  const today = new Date();
  const dateLabel = format(today, "yyyy-MM-dd");

  const rows = proposals.map((p) => {
    const created = new Date(p.createdAt);
    const pct =
      p.discountPercentage > 0
        ? p.discountPercentage
        : p.totalDebt > 0
        ? ((p.totalDebt - p.discountedValue) / p.totalDebt) * 100
        : 0;
    return {
      Data: format(created, "dd/MM/yyyy"),
      Hora: format(created, "HH:mm"),
      Vendedor: p.userName,
      Cliente: p.clientName,
      CNPJ: formatCnpj(p.cnpj),
      "Valor Original": p.totalDebt,
      "Valor c/ Desconto": p.discountedValue,
      "% Desconto": Number(pct.toFixed(2)),
      Honorários: p.feesValue,
    };
  });

  const ws = utils.json_to_sheet(rows);
  ws["!cols"] = [
    { wch: 12 }, { wch: 8 }, { wch: 24 }, { wch: 32 },
    { wch: 20 }, { wch: 16 }, { wch: 18 }, { wch: 12 }, { wch: 14 },
  ];

  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "Propostas");

  const buf = write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `propostas-hoje-${dateLabel}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
