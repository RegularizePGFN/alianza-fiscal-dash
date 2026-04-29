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
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
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
    min-height: 297mm;
    margin: 0 auto;
    background: #ffffff;
    position: relative;
    overflow: hidden;
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
    color: #0f172a;
    opacity: 0.035;
    transform: rotate(-30deg);
    white-space: nowrap;
    letter-spacing: 0.05em;
  }

  .content { position: relative; z-index: 1; }

  .header {
    background: linear-gradient(135deg, #1e3a8a 0%, #2a54c7 60%, #3567d8 100%);
    color: #ffffff;
    padding: 10mm 14mm;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1.2mm solid #0c9847;
  }
  .header__brand { display: flex; align-items: center; gap: 12px; }
  .header__logo { height: 44px; width: auto; object-fit: contain; }
  .header__eyebrow { font-size: 10px; letter-spacing: 0.18em; opacity: 0.85; font-weight: 500; }
  .header__title { font-size: 21px; font-weight: 700; margin-top: 2px; letter-spacing: -0.01em; }
  .header__meta { text-align: right; font-size: 10.5px; line-height: 1.5; }
  .header__meta div.label { opacity: 0.85; }
  .header__meta div.value { font-weight: 600; font-size: 12px; }

  .body { padding: 9mm 14mm 6mm; }

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
    background: #0f172a;
    color: #cbd5e1;
    padding: 4mm 14mm;
    font-size: 9.5px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    letter-spacing: 0.04em;
  }
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
          <div class="value">${escapeHtml(dueDate)}</div>
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
        <span>Documento gerado em ${escapeHtml(issueDate)}</span>
      </footer>
    </div>
  </div>
</body>
</html>`;
}

// ============================================================
// BROWSERLESS RENDER
// ============================================================

async function renderPdfWithBrowserless(html: string): Promise<Uint8Array> {
  if (!BROWSERLESS_URL_RAW) {
    throw new Error(
      "BROWSERLESS_URL não configurado. Adicione a URL base do Browserless nos Secrets (ex: https://production-sfo.browserless.io).",
    );
  }
  if (!BROWSERLESS_TOKEN) {
    throw new Error(
      "BROWSERLESS_TOKEN não configurado. Adicione sua API key da Browserless nos Secrets do projeto.",
    );
  }

  // Normaliza URL base: remove trailing slash, remove qualquer ?token= já existente
  // e extrai o caminho /pdf se o usuário passou a URL completa.
  let base = BROWSERLESS_URL_RAW.trim();
  // Remove qualquer query string acidental (caso o usuário tenha colado URL com ?token=)
  base = base.split("?")[0];
  // Remove trailing /pdf se já vier no secret, vamos sempre re-adicionar
  base = base.replace(/\/+pdf\/?$/i, "");
  base = base.replace(/\/+$/, "");

  const endpoint = `${base}/pdf?token=${encodeURIComponent(BROWSERLESS_TOKEN)}`;

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

  console.log("Browserless: chamando endpoint", base + "/pdf");

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
    if (res.status === 401 || res.status === 403) {
      throw new Error(
        `Browserless rejeitou o token (${res.status}). Verifique BROWSERLESS_TOKEN nos Secrets — deve ser apenas a API key, sem "?token=".`,
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

    const html = buildProposalHtml(payload);
    const pdfBytes = await renderPdfWithBrowserless(html);

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
