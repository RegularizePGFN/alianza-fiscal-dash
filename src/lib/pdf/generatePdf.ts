import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ExtractedData, CompanyData } from '../types/proposals';
import ProposalPdfTemplate from '@/components/proposals/pdf/ProposalPdfTemplate';

interface RenderOptions {
  data: Partial<ExtractedData>;
  companyData?: CompanyData | null;
  showWatermark?: boolean;
}

/**
 * Renders the dedicated PDF template offscreen and returns the rendered DOM element.
 * Caller is responsible for calling cleanup() to remove it from the document.
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
    // Allow layout + image load
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

  // Wait for fonts and images
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
  await new Promise((r) => setTimeout(r, 150));

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

function buildFileName(data: Partial<ExtractedData>, ext: 'pdf' | 'png', companyData?: CompanyData | null): string {
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

export async function generateProposalPdf(
  _legacyElement: HTMLElement | null,
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
      width: element.scrollWidth,
      height: element.scrollHeight,
    });

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
    pdf.setProperties({
      title: `Proposta PGFN - ${companyData?.company?.name || data.clientName || data.cnpj || 'Cliente'}`,
      subject: 'Proposta de Regularização PGFN',
      author: 'Aliança Fiscal',
      creator: 'Aliança Fiscal • Sistema de Propostas',
    });

    const pdfWidth = 210;
    const pdfHeight = 297;
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const imgProps = pdf.getImageProperties(imgData);
    const renderedWidth = pdfWidth;
    const renderedHeight = (imgProps.height * renderedWidth) / imgProps.width;

    pdf.addImage(imgData, 'JPEG', 0, 0, renderedWidth, renderedHeight, undefined, 'FAST');

    let heightLeft = renderedHeight - pdfHeight;
    let position = pdfHeight;
    while (heightLeft > 0) {
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, -position, renderedWidth, renderedHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;
      position += pdfHeight;
    }

    pdf.save(buildFileName(data, 'pdf', companyData));
  } finally {
    cleanup();
  }
}

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
