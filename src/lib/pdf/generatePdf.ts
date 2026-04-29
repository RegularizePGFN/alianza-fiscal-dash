import html2canvas from 'html2canvas';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ExtractedData, CompanyData } from '../types/proposals';
import ProposalPdfTemplate from '@/components/proposals/pdf/ProposalPdfTemplate';
import { supabase } from '@/integrations/supabase/client';

interface RenderOptions {
  data: Partial<ExtractedData>;
  companyData?: CompanyData | null;
  showWatermark?: boolean;
}

/**
 * Renderiza o template offscreen — usado APENAS para PNG no browser.
 */
async function renderTemplateOffscreen({
  data,
  companyData,
  showWatermark = true,
}: RenderOptions): Promise<{ element: HTMLElement; cleanup: () => void }> {
  const host = document.createElement('div');
  host.style.position = 'fixed';
  host.style.left = '-99999px';
  host.style.top = '0';
  host.style.width = '794px';
  host.style.background = '#ffffff';
  host.style.overflow = 'hidden';
  host.style.zIndex = '-1';
  document.body.appendChild(host);

  const root = createRoot(host);
  await new Promise<void>((resolve) => {
    root.render(
      React.createElement(ProposalPdfTemplate, {
        data,
        companyData,
        showWatermark,
      }),
    );
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

  try {
    await (document as any).fonts?.ready;
  } catch {
    // ignore
  }
  const imgs = Array.from(host.querySelectorAll('img'));
  await Promise.all(
    imgs.map((img) => {
      if ((img as HTMLImageElement).complete) return Promise.resolve();
      return new Promise<void>((res) => {
        (img as HTMLImageElement).onload = () => res();
        (img as HTMLImageElement).onerror = () => res();
      });
    }),
  );
  await new Promise((r) => setTimeout(r, 300));
  await new Promise<void>((res) =>
    requestAnimationFrame(() => requestAnimationFrame(() => res())),
  );

  const element = host.firstElementChild as HTMLElement;
  return {
    element,
    cleanup: () => {
      try {
        root.unmount();
      } catch {
        // ignore
      }
      if (host.parentNode) host.parentNode.removeChild(host);
    },
  };
}

function buildFileName(
  data: Partial<ExtractedData>,
  ext: 'pdf' | 'png',
  companyData?: CompanyData | null,
): string {
  const company = (companyData?.company?.name || data.clientName || data.cnpj || 'cliente')
    .toString()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .slice(0, 40);
  const today = new Date();
  const stamp = `${String(today.getDate()).padStart(2, '0')}${String(
    today.getMonth() + 1,
  ).padStart(2, '0')}${today.getFullYear()}`;
  return `Proposta_PGFN_${company}_${stamp}.${ext}`;
}

function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Gera o PDF profissional via edge function (Chromium headless).
 * Resultado: PDF nativo, vetorial, fiel ao preview, com fontes reais e CSS real.
 */
export async function generateProposalPdf(
  _legacyElement: HTMLElement | null,
  data: Partial<ExtractedData>,
  companyData?: CompanyData | null,
): Promise<void> {
  const showWatermark = data.showWatermark !== 'false';

  // Logo absoluta para o Chromium remoto conseguir baixar
  const logoUrl = `${window.location.origin}/lovable-uploads/d939ccfc-a061-45e8-97e0-1fa1b82d3df2.png`;

  const { data: result, error } = await supabase.functions.invoke(
    'generate-proposal-pdf',
    {
      body: {
        data,
        companyData,
        showWatermark,
        logoUrl,
      },
    },
  );

  if (error) {
    console.error('Erro na edge function generate-proposal-pdf:', error);
    throw new Error(
      'Não foi possível gerar o PDF profissional. Tente novamente em instantes.',
    );
  }

  // supabase.functions.invoke devolve Blob para respostas binárias
  let blob: Blob;
  if (result instanceof Blob) {
    blob = result;
  } else if (result instanceof ArrayBuffer) {
    blob = new Blob([result], { type: 'application/pdf' });
  } else if (typeof result === 'object' && result && 'error' in (result as any)) {
    throw new Error((result as any).error || 'Falha ao gerar PDF');
  } else {
    // fallback defensivo
    blob = new Blob([result as any], { type: 'application/pdf' });
  }

  triggerDownload(blob, buildFileName(data, 'pdf', companyData));
}

/**
 * PNG continua sendo gerado no front-end via html2canvas
 * (suficiente para imagem de resumo/preview).
 */
export async function generateProposalTemplatePng(
  data: Partial<ExtractedData>,
  companyData?: CompanyData | null,
): Promise<void> {
  const { element, cleanup } = await renderTemplateOffscreen({
    data,
    companyData,
    showWatermark: data.showWatermark !== 'false',
  });
  try {
    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
    });
    const link = document.createElement('a');
    link.download = buildFileName(data, 'png', companyData);
    link.href = canvas.toDataURL('image/png', 1.0);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } finally {
    cleanup();
  }
}
