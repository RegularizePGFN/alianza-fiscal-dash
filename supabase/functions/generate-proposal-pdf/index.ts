// Edge function: gera PDF profissional da proposta usando Chromium headless via Browserless.
// Renderiza HTML real (CSS + Inter), exporta com Page.printToPDF e devolve binário.
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BROWSERLESS_URL_RAW = Deno.env.get("BROWSERLESS_URL");
const BROWSERLESS_TOKEN = Deno.env.get("BROWSERLESS_TOKEN");

// ============================================================
// HTML TEMPLATE
// ============================================================

interface ProposalPayload {
  data: Record<string, any>;
  companyData?: any | null;
  showWatermark?: boolean;
  logoUrl?: string;
  pdfTemplate?: "classic" | "alianca";
}

const escapeHtml = (s: unknown): string => {
  if (s === null || s === undefined) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const fmtMoney = (value?: string) => {
  if (!value) return "R$ 0,00";
  if (String(value).includes("R$")) return String(value);
  return `R$ ${value}`;
};

const formatCnpj = (cnpj?: string) => {
  if (!cnpj) return "-";
  const digits = String(cnpj).replace(/\D/g, "");
  if (digits.length !== 14) return cnpj;
  return digits.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5",
  );
};

const formatDateBR = (date: Date) => {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

const getLastBusinessDayOfMonth = (date: Date) => {
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const dow = last.getDay();
  if (dow === 0) last.setDate(last.getDate() - 2);
  else if (dow === 6) last.setDate(last.getDate() - 1);
  return last;
};

const calculateEconomy = (totalDebt?: string, discountedValue?: string) => {
  if (!totalDebt || !discountedValue) return "0,00";
  try {
    const a = parseFloat(
      String(totalDebt).replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, ""),
    );
    const b = parseFloat(
      String(discountedValue).replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, ""),
    );
    if (isNaN(a) || isNaN(b)) return "0,00";
    return (a - b).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } catch {
    return "0,00";
  }
};

function buildProposalHtml(payload: ProposalPayload): string {
  const { data = {}, companyData = null, showWatermark = true, logoUrl } = payload;

  const today = new Date();
  const issueDate = formatDateBR(today);
  const dueDate = formatDateBR(getLastBusinessDayOfMonth(today));

  // Validity date: prefer user-defined value from data.validityDate, fallback = issue + 24h
  const parseValidity = (): Date => {
    const v = data.validityDate;
    if (v) {
      // Try BR formats first: "dd/MM/yyyy HH:mm" or "dd/MM/yyyy"
      const brMatch = String(v).match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?/);
      if (brMatch) {
        const [, dd, mm, yyyy, hh = "23", mi = "59"] = brMatch;
        return new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(mi));
      }
      const iso = new Date(String(v));
      if (!isNaN(iso.getTime())) return iso;
    }
    const fallback = new Date(today);
    fallback.setDate(fallback.getDate() + 1);
    return fallback;
  };
  const validityDate = formatDateBR(parseValidity());

  const hasDiscount = (() => {
    if (!data.totalDebt || !data.discountedValue) return false;
    try {
      const td = parseFloat(
        String(data.totalDebt).replace(/\./g, "").replace(",", "."),
      );
      const dv = parseFloat(
        String(data.discountedValue).replace(/\./g, "").replace(",", "."),
      );
      return td > dv && data.discountPercentage !== "0" && data.discountPercentage !== "0,00";
    } catch {
      return false;
    }
  })();

  const economy = calculateEconomy(data.totalDebt, data.discountedValue);

  const entryInstallments = parseInt(data.entryInstallments || "1", 10) || 1;
  const installmentsCount = parseInt(data.installments || "0", 10) || 0;

  const entryInstallmentValue = (() => {
    if (!data.entryValue) return "0,00";
    if (entryInstallments <= 1) return data.entryValue;
    try {
      const v = parseFloat(
        String(data.entryValue).replace(/\./g, "").replace(",", "."),
      );
      return (v / entryInstallments).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } catch {
      return data.entryValue;
    }
  })();

  const showFeesInstallments =
    data.showFeesInstallments === "true" &&
    data.feesInstallmentValue &&
    data.feesInstallments &&
    parseInt(data.feesInstallments) > 0;

  const formatAddr = (addr: any) => {
    if (!addr) return "";
    return [
      addr.street,
      addr.number ? `Nº ${addr.number}` : "",
      addr.details || "",
      addr.district,
      addr.city && addr.state ? `${addr.city}/${addr.state}` : "",
      addr.zip ? `CEP: ${addr.zip}` : "",
    ]
      .filter(Boolean)
      .join(", ");
  };

  const field = (label: string, value: string, full = false) => `
    <div class="field${full ? " field--full" : ""}">
      <div class="field__label">${escapeHtml(label.toUpperCase())}</div>
      <div class="field__value">${escapeHtml(value || "-")}</div>
    </div>`;

  const summaryCard = (
    label: string,
    value: string,
    tone: "neutral" | "primary" | "success",
    badge?: string,
  ) => `
    <div class="summary summary--${tone}">
      <div class="summary__label">${escapeHtml(label)}</div>
      <div class="summary__value">${escapeHtml(value)}</div>
      ${badge ? `<span class="summary__badge">${escapeHtml(badge)}</span>` : ""}
    </div>`;

  const section = (title: string, body: string) => `
    <section class="section">
      <h2 class="section__title">${escapeHtml(title)}</h2>
      ${body}
    </section>`;

  const contribuinteRows = `
    <div class="grid grid--2">
      ${field("CNPJ", formatCnpj(data.cnpj))}
      ${field("Número do Débito", data.debtNumber || "-")}
      ${companyData?.company?.name ? field("Razão Social", companyData.company.name, true) : ""}
      ${companyData?.status?.text ? field("Situação", companyData.status.text) : ""}
      ${companyData?.founded ? field("Data de Abertura", new Date(companyData.founded).toLocaleDateString("pt-BR")) : ""}
      ${companyData?.address ? field("Endereço", formatAddr(companyData.address), true) : ""}
      ${companyData?.mainActivity ? field("Atividade Principal", `${companyData.mainActivity.id} • ${companyData.mainActivity.text}`, true) : ""}
    </div>`;

  const resumoNegociacao = hasDiscount
    ? section(
        "Resumo da Negociação",
        `<div class="grid grid--3">
          ${summaryCard("Valor Consolidado", fmtMoney(data.totalDebt), "neutral")}
          ${summaryCard("Valor com Reduções", fmtMoney(data.discountedValue), "primary")}
          ${summaryCard(
            "Economia",
            `R$ ${economy}`,
            "success",
            `${data.discountPercentage}% off`,
          )}
        </div>`,
      )
    : "";

  const opcoesPagamento = section(
    "Opções de Pagamento",
    `<div class="grid grid--12">
      <div class="card card--cash">
        <div class="card__eyebrow">À VISTA</div>
        <div class="card__money card__money--green">${escapeHtml(fmtMoney(data.discountedValue))}</div>
        <div class="card__hint">Pagamento em parcela única</div>
      </div>
      <div class="card card--installments">
        <div class="card__eyebrow card__eyebrow--blue">PARCELADO</div>
        <div class="grid grid--2 grid--gap-lg" style="margin-top:8px;">
          <div>
            <div class="micro">ENTRADA</div>
            <div class="card__line">
              ${
                entryInstallments > 1
                  ? `${entryInstallments}x de R$ ${escapeHtml(entryInstallmentValue)}`
                  : `R$ ${escapeHtml(data.entryValue || "0,00")}`
              }
            </div>
            <div class="micro micro--soft">Total: ${escapeHtml(fmtMoney(data.entryValue))}</div>
          </div>
          ${
            installmentsCount > 0
              ? `<div class="card__split">
                  <div class="micro">PARCELAS RESTANTES</div>
                  <div class="card__line">${installmentsCount}x de ${escapeHtml(fmtMoney(data.installmentValue))}</div>
                </div>`
              : ""
          }
        </div>
      </div>
    </div>
    <div class="callout">
      <strong>Importante:</strong> a 1ª parcela da entrada deve ser paga até
      <strong>${escapeHtml(dueDate)}</strong> às 20h. Demais parcelas: último dia útil de cada mês.
    </div>`,
  );

  const honorarios = data.feesValue
    ? section(
        "Honorários",
        `<div class="grid ${showFeesInstallments ? "grid--2" : "grid--1"}">
          <div class="fees fees--row">
            <div>
              <div class="fees__eyebrow">À VISTA</div>
              <div class="fees__hint">Pagamento imediato</div>
            </div>
            <div class="fees__money">${escapeHtml(fmtMoney(data.feesValue))}</div>
          </div>
          ${
            showFeesInstallments
              ? `<div class="fees">
                  <div class="fees__eyebrow">PARCELADO</div>
                  <div class="fees__money fees__money--md">${escapeHtml(data.feesInstallments)}x de ${escapeHtml(fmtMoney(data.feesInstallmentValue))}</div>
                  <div class="fees__hint">Total: ${escapeHtml(fmtMoney(data.feesTotalInstallmentValue))}</div>
                </div>`
              : ""
          }
        </div>`,
      )
    : "";

  const observacoes = data.additionalComments
    ? section(
        "Observações",
        `<div class="observations">${escapeHtml(data.additionalComments)}</div>`,
      )
    : "";

  const footerExec =
    data.includeExecutiveData === "true" || data.sellerName || data.specialistName
      ? `<div class="exec">
          <div class="exec__disclaimer">
            Esta proposta é confidencial e destina-se exclusivamente ao contribuinte
            identificado. Os valores apresentados refletem a simulação realizada na data de
            emissão e podem sofrer alterações conforme atualizações do PGFN.
          </div>
          ${
            data.includeExecutiveData === "true" && data.executiveName
              ? `<div class="exec__card">
                  <div class="exec__eyebrow">ESPECIALISTA RESPONSÁVEL</div>
                  <div class="exec__name">${escapeHtml(data.executiveName)}</div>
                  ${data.executiveEmail ? `<div>${escapeHtml(data.executiveEmail)}</div>` : ""}
                  ${data.executivePhone ? `<div>${escapeHtml(data.executivePhone)}</div>` : ""}
                </div>`
              : ""
          }
        </div>`
      : "";

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>Proposta PGFN</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 0; }
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #ffffff; }
  body {
    font-family: 'Inter', system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    color: #0f172a;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    font-size: 12px;
    line-height: 1.45;
  }

  .page {
    width: 210mm;
    height: 297mm;
    margin: 0 auto;
    background: #ffffff;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .watermark {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    z-index: 0;
  }
  .watermark span {
    font-size: 120px;
    font-weight: 800;
    color: #0b1d3a;
    opacity: 0.04;
    transform: rotate(-30deg);
    white-space: nowrap;
    letter-spacing: 0.05em;
  }

  .content {
    position: relative;
    z-index: 1;
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .header {
    background: linear-gradient(180deg, #0b1d3a 0%, #0a1a35 100%);
    color: #ffffff;
    padding: 10mm 14mm;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1.2mm solid #d4c5a0;
    flex-shrink: 0;
  }
  .header__brand { display: flex; align-items: center; gap: 14px; }
  .header__logo { height: 48px; width: auto; object-fit: contain; }
  .header__eyebrow { font-size: 10px; letter-spacing: 0.18em; opacity: 0.85; font-weight: 500; color: #d4c5a0; }
  .header__title { font-size: 22px; font-weight: 700; margin-top: 2px; letter-spacing: -0.005em; font-family: 'Playfair Display', Georgia, serif; }
  .header__meta { text-align: right; font-size: 10.5px; line-height: 1.5; }
  .header__meta div.label { opacity: 0.75; }
  .header__meta div.value { font-weight: 600; font-size: 12px; }

  .body { padding: 9mm 14mm 6mm; flex: 1 1 auto; min-height: 0; }

  .section { margin-bottom: 7mm; page-break-inside: avoid; break-inside: avoid; }
  .section__title {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: #1e3a8a;
    margin: 0 0 8px 0;
    padding-bottom: 5px;
    border-bottom: 2px solid #1e3a8a;
    text-transform: uppercase;
  }

  .grid { display: grid; gap: 10px; }
  .grid--1 { grid-template-columns: 1fr; }
  .grid--2 { grid-template-columns: 1fr 1fr; column-gap: 22px; row-gap: 10px; }
  .grid--3 { grid-template-columns: repeat(3, 1fr); }
  .grid--12 { grid-template-columns: 1fr 2fr; }
  .grid--gap-lg { gap: 14px; }

  .field__label { font-size: 9.5px; color: #94a3b8; font-weight: 600; letter-spacing: 0.05em; }
  .field__value { font-size: 11.5px; color: #0f172a; font-weight: 500; margin-top: 2px; }
  .field--full { grid-column: 1 / -1; }

  .summary {
    border-radius: 10px;
    padding: 12px 14px;
    position: relative;
    border: 1px solid;
  }
  .summary__label { font-size: 9.5px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; }
  .summary__value { font-size: 19px; font-weight: 700; margin-top: 6px; font-variant-numeric: tabular-nums; }
  .summary__badge {
    position: absolute;
    top: 7px;
    right: 8px;
    font-size: 9px;
    font-weight: 700;
    color: #ffffff;
    padding: 0 9px;
    border-radius: 999px;
    height: 18px;
    line-height: 18px;
    display: inline-block;
    text-align: center;
    white-space: nowrap;
  }
  .summary--neutral { background: #f8fafc; border-color: #e2e8f0; color: #0f172a; }
  .summary--neutral .summary__label { color: #64748b; }
  .summary--neutral .summary__badge { background: #0f172a; }
  .summary--primary { background: #eff6ff; border-color: #bfdbfe; color: #1e3a8a; }
  .summary--primary .summary__label { color: #3b82f6; }
  .summary--primary .summary__badge { background: #1e3a8a; }
  .summary--success { background: #ecfdf5; border-color: #a7f3d0; color: #065f46; }
  .summary--success .summary__label { color: #0c9847; }
  .summary--success .summary__badge { background: #065f46; }

  .card {
    border-radius: 10px;
    padding: 14px 16px;
    border: 1px solid #e2e8f0;
    background: #f8fafc;
  }
  .card--installments { background: #f0f5fd; border-color: #c1d7f7; }
  .card__eyebrow { font-size: 10px; color: #64748b; font-weight: 600; letter-spacing: 0.05em; }
  .card__eyebrow--blue { color: #274697; }
  .card__money {
    font-size: 22px; font-weight: 700; color: #0f172a; margin-top: 6px;
    font-variant-numeric: tabular-nums;
  }
  .card__money--green { color: #0c9847; }
  .card__hint { font-size: 10px; color: #64748b; margin-top: 4px; }
  .card__line { font-size: 14px; font-weight: 700; color: #1e293b; margin-top: 2px; font-variant-numeric: tabular-nums; }
  .card__split { border-left: 1px solid #c1d7f7; padding-left: 14px; }
  .micro { font-size: 9.5px; color: #64748b; font-weight: 500; }
  .micro--soft { color: #64748b; font-weight: 400; }

  .callout {
    margin-top: 10px;
    padding: 9px 12px;
    background: #fef9c3;
    border: 1px solid #fde68a;
    border-radius: 8px;
    font-size: 10.5px;
    color: #713f12;
    line-height: 1.55;
  }

  .fees {
    border-radius: 10px;
    padding: 14px 16px;
    background: #f5f3ff;
    border: 1px solid #ddd6fe;
  }
  .fees--row { display: flex; justify-content: space-between; align-items: center; }
  .fees__eyebrow { font-size: 10px; font-weight: 600; color: #6b21a8; letter-spacing: 0.05em; }
  .fees__hint { font-size: 10px; color: #7c3aed; margin-top: 2px; }
  .fees__money { font-size: 22px; font-weight: 700; color: #581c87; font-variant-numeric: tabular-nums; }
  .fees__money--md { font-size: 17px; margin-top: 4px; }

  .observations {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 11.5px;
    color: #334155;
    line-height: 1.6;
    white-space: pre-wrap;
  }

  .exec {
    margin-top: 7mm;
    padding-top: 5mm;
    border-top: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    gap: 18px;
    align-items: flex-start;
  }
  .exec__disclaimer { font-size: 10px; color: #64748b; max-width: 60%; line-height: 1.6; }
  .exec__card { text-align: right; font-size: 10.5px; color: #475569; line-height: 1.6; }
  .exec__eyebrow { font-size: 9.5px; color: #94a3b8; letter-spacing: 0.08em; }
  .exec__name { font-size: 12.5px; font-weight: 700; color: #0f172a; margin-top: 2px; }

  .footer {
    background: #0b1d3a;
    color: #d4c5a0;
    padding: 4mm 14mm;
    font-size: 9.5px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    letter-spacing: 0.04em;
    flex-shrink: 0;
    border-top: 0.4mm solid #d4c5a0;
  }
  .footer .footer__right { color: #cbd5e1; }
</style>
</head>
<body>
  <div class="page">
    ${
      showWatermark
        ? `<div class="watermark"><span>ALIANÇA FISCAL</span></div>`
        : ""
    }
    <div class="content">
      <header class="header">
        <div class="header__brand">
          ${logoUrl ? `<img class="header__logo" src="${escapeHtml(logoUrl)}" alt="Aliança Fiscal" />` : ""}
          <div>
            <div class="header__eyebrow">ALIANÇA FISCAL • CONSULTORIA TRIBUTÁRIA</div>
            <div class="header__title">Proposta de Regularização PGFN</div>
          </div>
        </div>
        <div class="header__meta">
          <div class="label">Emissão</div>
          <div class="value">${escapeHtml(issueDate)}</div>
          <div class="label" style="margin-top:4px;">Validade</div>
          <div class="value">${escapeHtml(validityDate)}</div>
        </div>
      </header>

      <main class="body">
        ${section("Dados do Contribuinte", contribuinteRows)}
        ${resumoNegociacao}
        ${opcoesPagamento}
        ${honorarios}
        ${observacoes}
        ${footerExec}
      </main>

      <footer class="footer">
        <span>Aliança Fiscal • Consultoria Tributária</span>
        <span class="footer__right">Documento gerado em ${escapeHtml(issueDate)}</span>
      </footer>
    </div>
  </div>
</body>
</html>`;
}

// ============================================================
// HTML TEMPLATE — MODELO 2 (Aliança)
// ============================================================

const MONTHS_PT = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];
const MONTHS_SHORT_PT = [
  "jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez",
];

function buildAliancaHtml(payload: ProposalPayload): string {
  const { data = {}, companyData = null, logoUrl } = payload;

  const today = new Date();
  const issueDate = formatDateBR(today);

  const parseValidity = (): Date => {
    const v = data.validityDate;
    if (v) {
      const m = String(v).match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?/);
      if (m) {
        const [, dd, mm, yyyy, hh = "23", mi = "59"] = m;
        return new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(mi));
      }
      const iso = new Date(String(v));
      if (!isNaN(iso.getTime())) return iso;
    }
    const fb = new Date(today);
    fb.setDate(fb.getDate() + 1);
    return fb;
  };
  const validityDate = formatDateBR(parseValidity());

  const hasDiscount = (() => {
    if (!data.totalDebt || !data.discountedValue) return false;
    try {
      const td = parseFloat(String(data.totalDebt).replace(/\./g, "").replace(",", "."));
      const dv = parseFloat(String(data.discountedValue).replace(/\./g, "").replace(",", "."));
      return td > dv && data.discountPercentage !== "0" && data.discountPercentage !== "0,00";
    } catch {
      return false;
    }
  })();

  const economy = calculateEconomy(data.totalDebt, data.discountedValue);
  const installmentsCount = parseInt(String(data.installments || "0"), 10) || 0;
  const discountPctNum = Math.round(
    parseFloat(String(data.discountPercentage || "0").replace(",", ".")) || 0,
  );

  const addMonthsLocal = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);
  const due1 = getLastBusinessDayOfMonth(today);
  const due2 = getLastBusinessDayOfMonth(addMonthsLocal(today, 1));
  const month3 = addMonthsLocal(today, 2);
  const month1Name = MONTHS_PT[today.getMonth()];
  const month2Name = MONTHS_PT[addMonthsLocal(today, 1).getMonth()];
  const monthFromShort = `${MONTHS_SHORT_PT[month3.getMonth()]}/${String(month3.getFullYear()).slice(-2)}`;
  const todayShort = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}`;

  const clientName = String(companyData?.company?.name || data.clientName || "").toUpperCase();
  const cnpj = formatCnpj(data.cnpj);
  const installmentValueLabel = fmtMoney(data.installmentValue);
  const totalDebtLabel = fmtMoney(data.totalDebt);
  const discountedLabel = fmtMoney(data.discountedValue);
  const feesValueLabel = fmtMoney(data.feesValue);

  const addressLine = (() => {
    const a = companyData?.address;
    if (!a) return "";
    return [
      a.street + (a.number ? `, ${a.number}` : ""),
      a.district ? `— ${a.district}` : "",
      a.city && a.state ? `${a.city}/${a.state}` : "",
      a.zip ? `CEP ${a.zip}` : "",
    ].filter(Boolean).join(", ");
  })();

  const cadastrais = [
    companyData?.status?.text ? `Situação ${companyData.status.text}` : "",
    companyData?.founded ? `Abertura ${new Date(companyData.founded).toLocaleDateString("pt-BR")}` : "",
    companyData?.mainActivity
      ? `CNAE ${companyData.mainActivity.id} ${String(companyData.mainActivity.text).split(" ").slice(0, 3).join(" ")}`
      : "",
    addressLine,
    data.debtNumber ? `Débito ${data.debtNumber}` : "Débito a confirmar",
  ].filter(Boolean).join(" · ");

  const exec = data.includeExecutiveData === "true"
    ? { name: data.executiveName || "", email: data.executiveEmail || "" }
    : { name: data.specialistName || data.sellerName || "", email: data.sellerEmail || "" };

  const chipBg = hasDiscount ? "#22c55e" : "#3b82f6";
  const chipText = hasDiscount ? `−${discountPctNum}%` : "SEM JUROS";

  const heroBody = hasDiscount
    ? `
      <div class="hero__value hero__value--green">R$ ${escapeHtml(economy)}</div>
      <div class="hero__sub">em reduções de juros e multas concedidas pela PGFN</div>
      <div class="hero__pill">
        Dívida original <span class="strike">${escapeHtml(totalDebtLabel)}</span>
        → você regulariza por <span class="hero__pillStrong">${escapeHtml(discountedLabel)}</span>
      </div>`
    : `
      <div class="hero__value hero__value--white">Parcelamento sem juros</div>
      <div class="hero__sub">Regularize sua dívida em até ${installmentsCount}x sem nenhum acréscimo e suspenda as cobranças.</div>
      <div class="hero__pill">
        Valor da dívida mantido <span class="hero__pillStrong">${escapeHtml(totalDebtLabel)}</span>
        · ${installmentsCount}x de <span class="hero__pillStrong">${escapeHtml(installmentValueLabel)}</span>
      </div>`;

  const timelineRow = (
    when: string, sub: string, label: string, value: string, last = false,
  ) => `
    <div class="trow">
      <div class="trow__when">
        <div class="trow__date">${escapeHtml(when)}</div>
        ${sub ? `<div class="trow__sub">${escapeHtml(sub)}</div>` : ""}
      </div>
      <div class="trow__dot ${last ? "trow__dot--last" : ""}"><span class="dot dot--blue"></span></div>
      <div class="trow__body">
        <span class="trow__label">${escapeHtml(label)}</span>
        <span class="trow__value">${escapeHtml(value)}</span>
      </div>
    </div>`;

  const todayRow = `
    <div class="trow">
      <div class="trow__when">
        <div class="trow__date">Hoje · ${escapeHtml(todayShort)}</div>
      </div>
      <div class="trow__dot"><span class="dot dot--green dot--filled"></span></div>
      <div class="trow__body">
        <div class="paghoje">
          <div>
            <div class="paghoje__eyebrow">PAGUE HOJE</div>
            <div class="paghoje__title">Honorários Aliança Fiscal</div>
            <div class="paghoje__sub">Único valor para iniciar a regularização agora</div>
          </div>
          <div class="paghoje__money">${escapeHtml(feesValueLabel)}</div>
        </div>
      </div>
    </div>`;

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>Proposta PGFN</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 0; }
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #fff; }
  body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    color: #0f172a;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    font-size: 12px;
  }
  .page { width: 210mm; min-height: 297mm; margin: 0 auto; display: flex; flex-direction: column; }
  .header { padding: 10mm 14mm 0; display: flex; justify-content: space-between; align-items: flex-start; }
  .brand { display: flex; align-items: center; gap: 10px; }
  .brand img { height: 36px; width: auto; object-fit: contain; }
  .brand__name { font-size: 15px; font-weight: 700; color: #0b1d3a; letter-spacing: 0.04em; }
  .brand__tag { font-size: 9px; color: #64748b; letter-spacing: 0.18em; }
  .meta { text-align: right; font-size: 9px; color: #64748b; line-height: 1.6; }
  .meta__eyebrow { letter-spacing: 0.18em; font-weight: 600; }
  .meta__title { font-size: 14px; color: #0b1d3a; font-weight: 700; letter-spacing: 0.06em; }
  .meta__strong { color: #0b1d3a; font-weight: 600; }
  .stripe { margin: 6mm 14mm 0; height: 4px; border-radius: 2px;
    background: linear-gradient(90deg, #3b82f6 0%, #22c55e 100%); }
  .proposta { padding: 6mm 14mm 0; display: flex; align-items: baseline; gap: 12px; }
  .proposta__eyebrow { font-size: 9px; letter-spacing: 0.18em; color: #64748b; font-weight: 600; }
  .proposta__client { font-size: 16px; font-weight: 700; color: #0b1d3a; }
  .proposta__cnpj { font-size: 10px; color: #64748b; margin-left: auto; }
  .proposta__cnpj strong { color: #0b1d3a; font-weight: 600; }

  .hero { margin: 5mm 14mm 0; background: linear-gradient(135deg, #0b1d3a 0%, #0f2548 100%);
    color: #fff; border-radius: 12px; padding: 22px 26px; position: relative; }
  .hero__eyebrow { font-size: 10px; letter-spacing: 0.18em; color: rgba(255,255,255,0.7); font-weight: 600; }
  .hero__value { font-size: 34px; font-weight: 800; margin-top: 4px; letter-spacing: -0.01em; line-height: 1.1; }
  .hero__value--green { color: #22c55e; }
  .hero__value--white { color: #fff; font-size: 28px; }
  .hero__sub { font-size: 11px; color: rgba(255,255,255,0.8); margin-top: 4px; max-width: 540px; }
  .hero__pill { display: inline-block; margin-top: 14px; background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; padding: 8px 14px;
    font-size: 11px; color: rgba(255,255,255,0.85); }
  .hero__pillStrong { color: #22c55e; font-weight: 700; }
  .hero__pill .strike { text-decoration: line-through; opacity: 0.6; }
  .chip { position: absolute; top: 20px; right: 24px; background: ${chipBg}; color: #fff;
    font-size: 11px; font-weight: 700; padding: 5px 12px; border-radius: 999px; letter-spacing: 0.04em; }

  .sectionTitle { padding: 8mm 14mm 0; font-size: 10px; letter-spacing: 0.18em;
    color: #64748b; font-weight: 700; }
  .sectionRule { margin: 2mm 14mm 0; border-top: 1px solid #e2e8f0; }

  .notice { margin: 3mm 14mm 0; background: #f8fafc; border: 1px solid #e2e8f0;
    border-radius: 10px; padding: 12px 16px; font-size: 11px; color: #334155; line-height: 1.55; }
  .notice strong { color: #16a34a; }

  .timeline { margin: 3mm 14mm 0; }
  .trow { display: flex; align-items: stretch; gap: 14px; min-height: 44px; }
  .trow__when { width: 110px; text-align: right; padding-top: 12px; }
  .trow__date { font-size: 11px; font-weight: 700; color: #0f172a; }
  .trow__sub { font-size: 8.5px; color: #94a3b8; margin-top: 1px; }
  .trow__dot { width: 14px; position: relative; display: flex; flex-direction: column;
    align-items: center; padding-top: 14px; }
  .trow__dot::after { content: ''; width: 1px; flex: 1; background: #e2e8f0; margin-top: 2px; }
  .trow__dot--last::after { display: none; }
  .dot { width: 10px; height: 10px; border-radius: 50%; background: #fff; }
  .dot--blue { border: 2px solid #3b82f6; }
  .dot--green { border: 2px solid #22c55e; }
  .dot--filled { background: #22c55e; }
  .trow__body { flex: 1; display: flex; justify-content: space-between; align-items: center;
    padding: 10px 0; }
  .trow__label { font-size: 11.5px; color: #0f172a; }
  .trow__value { font-size: 13px; font-weight: 700; color: #0f172a; }

  .paghoje { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px;
    padding: 14px 18px; display: flex; align-items: center; justify-content: space-between;
    width: 100%; }
  .paghoje__eyebrow { font-size: 9px; letter-spacing: 0.18em; color: #16a34a; font-weight: 700; }
  .paghoje__title { font-size: 13px; font-weight: 700; color: #0b1d3a; margin-top: 2px; }
  .paghoje__sub { font-size: 10px; color: #64748b; margin-top: 2px; }
  .paghoje__money { font-size: 20px; font-weight: 800; color: #16a34a; }

  .options { margin: 3mm 14mm 0; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .opt { border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 18px; }
  .opt__eyebrow { font-size: 9px; letter-spacing: 0.18em; color: #64748b; font-weight: 700; }
  .opt__value { font-size: 22px; font-weight: 800; color: #0b1d3a; margin-top: 4px; }
  .opt__value--green { color: #16a34a; }
  .opt__permes { font-size: 12px; font-weight: 600; color: #64748b; }
  .opt__sub { font-size: 10px; color: #64748b; margin-top: 2px; }

  .cta { margin: 5mm 14mm 0; background: linear-gradient(135deg, #0b1d3a 0%, #0f2548 100%);
    border-radius: 10px; padding: 16px 22px; display: flex; justify-content: space-between;
    align-items: center; color: #fff; }
  .cta__title { font-size: 14px; font-weight: 700; }
  .cta__sub { font-size: 10px; color: rgba(255,255,255,0.75); margin-top: 2px; max-width: 420px; }
  .cta__label { font-size: 10px; color: rgba(255,255,255,0.75); text-align: right; }
  .cta__money { font-size: 22px; font-weight: 800; color: #22c55e; text-align: right; }

  .cadastrais { padding: 5mm 14mm 0; font-size: 9px; color: #64748b; line-height: 1.55; }
  .cadastrais strong { color: #334155; font-weight: 600; }

  .spacer { flex: 1; }

  .footer { margin: 6mm 14mm 6mm; padding-top: 4mm; border-top: 1px solid #e2e8f0;
    display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; }
  .footer__brand { font-size: 12px; font-weight: 700; color: #0b1d3a; }
  .footer__exec { font-size: 10px; color: #64748b; margin-top: 2px; }
  .footer__exec strong { color: #0b1d3a; font-weight: 600; }
  .footer__disc { text-align: right; font-size: 9px; color: #64748b; line-height: 1.55; }
  .footer__disc strong { color: #0b1d3a; font-weight: 600; }
</style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="brand">
        ${logoUrl ? `<img src="${escapeHtml(logoUrl)}" alt="Aliança Fiscal" />` : ""}
        <div>
          <div class="brand__name">ALIANÇA FISCAL</div>
          <div class="brand__tag">Consultoria Tributária</div>
        </div>
      </div>
      <div class="meta">
        <div class="meta__eyebrow">PROPOSTA DE</div>
        <div class="meta__title">REGULARIZAÇÃO PGFN</div>
        <div>Emissão <span class="meta__strong">${escapeHtml(issueDate)}</span> · Validade <span class="meta__strong">${escapeHtml(validityDate)}</span></div>
      </div>
    </div>
    <div class="stripe"></div>

    <div class="proposta">
      <span class="proposta__eyebrow">PROPOSTA PARA</span>
      <span class="proposta__client">${escapeHtml(clientName)}</span>
      <span class="proposta__cnpj">CNPJ <strong>${escapeHtml(cnpj)}</strong></span>
    </div>

    <div class="hero">
      <div class="chip">${escapeHtml(chipText)}</div>
      <div class="hero__eyebrow">${hasDiscount ? "SUA ECONOMIA" : "SEU BENEFÍCIO"}</div>
      ${heroBody}
    </div>

    <div class="sectionTitle">SEU PLANEJAMENTO DE PAGAMENTOS</div>
    <div class="sectionRule"></div>
    <div class="notice">
      Hoje você paga <strong>apenas os honorários da Aliança Fiscal.</strong>
      A parcela da negociação com a PGFN só vence no último dia útil do mês — e segue assim nos meses seguintes.
    </div>
    <div class="timeline">
      ${todayRow}
      ${timelineRow(formatDateBR(due1), `último dia útil de ${month1Name}`, "1ª parcela da negociação (PGFN)", installmentValueLabel)}
      ${timelineRow(formatDateBR(due2), `último dia útil de ${month2Name}`, "2ª parcela da negociação", installmentValueLabel, installmentsCount <= 2)}
      ${installmentsCount > 2 ? timelineRow(`a partir de ${monthFromShort}`, "sempre no último dia útil", `demais parcelas (3ª a ${installmentsCount}ª)`, installmentValueLabel, true) : ""}
    </div>

    <div class="sectionTitle">OPÇÕES PARA A NEGOCIAÇÃO</div>
    <div class="sectionRule"></div>
    <div class="options">
      <div class="opt">
        <div class="opt__eyebrow">À VISTA</div>
        <div class="opt__value ${hasDiscount ? "opt__value--green" : ""}">${escapeHtml(hasDiscount ? discountedLabel : totalDebtLabel)}</div>
        <div class="opt__sub">${hasDiscount ? "Parcela única · desconto máximo aplicado" : "Pagamento único da dívida"}</div>
      </div>
      <div class="opt">
        <div class="opt__eyebrow">PARCELADO · ${installmentsCount}X SEM JUROS</div>
        <div class="opt__value">${escapeHtml(installmentValueLabel)}<span class="opt__permes">/mês</span></div>
        <div class="opt__sub">Entrada R$ 0,00 · 1ª parcela no último dia útil do mês</div>
      </div>
    </div>

    <div class="cta">
      <div>
        <div class="cta__title">Pronto para regularizar?</div>
        <div class="cta__sub">Confirme esta proposta e pague hoje apenas os honorários. Cuidamos de toda a formalização da adesão na PGFN.</div>
      </div>
      <div>
        <div class="cta__label">Para iniciar hoje</div>
        <div class="cta__money">${escapeHtml(feesValueLabel)}</div>
      </div>
    </div>

    ${cadastrais ? `<div class="cadastrais"><strong>Dados cadastrais:</strong> ${escapeHtml(cadastrais)}</div>` : ""}

    <div class="spacer"></div>

    <div class="footer">
      <div>
        <div class="footer__brand">Aliança Fiscal</div>
        ${exec.name ? `<div class="footer__exec">Especialista <strong>${escapeHtml(exec.name)}</strong>${exec.email ? ` · ${escapeHtml(exec.email)}` : ""}</div>` : ""}
      </div>
      <div class="footer__disc">
        <div><strong>Documento confidencial</strong> — exclusivo ao contribuinte identificado.</div>
        <div>Valores conforme simulação de ${escapeHtml(issueDate)}, sujeitos a atualização da PGFN.</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ============================================================

const DEFAULT_BROWSERLESS_BASE = "https://production-sfo.browserless.io";

function normalizeToken(raw: string): string {
  let t = raw.trim().replace(/^["']|["']$/g, "").trim();
  // Se colaram URL completa, extrai ?token=...
  const m = t.match(/[?&]token=([^&\s]+)/i);
  if (m) t = decodeURIComponent(m[1]);
  // Remove prefixos comuns
  t = t.replace(/^token[:=]\s*/i, "");
  t = t.replace(/^Bearer\s+/i, "");
  return t.trim();
}

async function renderPdfWithBrowserless(html: string): Promise<Uint8Array> {
  if (!BROWSERLESS_TOKEN) {
    throw new Error(
      "BROWSERLESS_TOKEN não configurado. Adicione sua API key da Browserless nos Secrets do projeto.",
    );
  }

  const token = normalizeToken(BROWSERLESS_TOKEN);
  if (!token) {
    throw new Error("BROWSERLESS_TOKEN está vazio após normalização.");
  }

  // Normaliza URL base. Se o secret BROWSERLESS_URL não existir, usa o endpoint
  // padrão da Browserless (production-sfo). Também limpa caminhos inválidos.
  let base = (BROWSERLESS_URL_RAW || DEFAULT_BROWSERLESS_BASE).trim();
  base = base.split("?")[0];
  for (let i = 0; i < 5; i++) {
    const before = base;
    base = base.replace(/\/+pdf\/?$/i, "");
    base = base.replace(/\/+function\/?$/i, "");
    base = base.replace(/\/+chrome\/?$/i, "");
    base = base.replace(/\/+chromium\/?$/i, "");
    base = base.replace(/\/+$/, "");
    if (before === base) break;
  }
  if (!/^https?:\/\//i.test(base)) {
    base = DEFAULT_BROWSERLESS_BASE;
  }

  const endpoint = `${base}/pdf?token=${encodeURIComponent(token)}`;

  const body = {
    html,
    options: {
      printBackground: true,
      preferCSSPageSize: true,
      format: "A4",
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    },
    gotoOptions: {
      waitUntil: "networkidle0",
      timeout: 30000,
    },
    waitForTimeout: 800,
  };

  const tokenPreview = `${token.slice(0, 4)}…${token.slice(-4)} (len=${token.length})`;
  console.log("Browserless: chamando endpoint", base + "/pdf", "token=", tokenPreview);

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const normalizedText = text.toLowerCase();
    console.error(
      `Browserless falhou: status=${res.status} token=${tokenPreview} body=${text.slice(0, 500)}`,
    );
    if (
      res.status === 429 ||
      normalizedText.includes("usage limit") ||
      normalizedText.includes("units usage limit") ||
      normalizedText.includes("free plan") ||
      normalizedText.includes("upgrade to a paid plan")
    ) {
      throw new Error(
        `Browserless: limite de uso excedido. A conta atingiu o limite do plano gratuito; faça upgrade em browserless.io/account/upgrade ou aguarde o reset da cota. Resposta: ${text.slice(0, 200) || "(vazio)"}`,
      );
    }
    if (res.status === 401 || res.status === 403) {
      throw new Error(
        `Browserless rejeitou o token (${res.status}). Resposta: ${text.slice(0, 200) || "(vazio)"}. Confirme em browserless.io/account que a API key bate com a usada (token preview: ${tokenPreview}).`,
      );
    }
    throw new Error(`Browserless falhou: ${res.status} ${text.slice(0, 300)}`);
  }

  const buf = new Uint8Array(await res.arrayBuffer());
  if (buf.length === 0) throw new Error("Browserless retornou PDF vazio");
  return buf;
}

// ============================================================
// HANDLER
// ============================================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = (await req.json()) as ProposalPayload;
    if (!payload || typeof payload !== "object" || !payload.data) {
      return new Response(JSON.stringify({ error: "Payload inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const html =
      payload.pdfTemplate === "alianca"
        ? buildAliancaHtml(payload)
        : buildProposalHtml(payload);
    const pdfBytes = await renderPdfWithBrowserless(html);

    console.log(`PDF gerado com sucesso: ${pdfBytes.length} bytes`);

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Length": String(pdfBytes.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("generate-proposal-pdf error:", error);
    return new Response(
      JSON.stringify({
        error: (error as Error)?.message || "Erro ao gerar PDF",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
