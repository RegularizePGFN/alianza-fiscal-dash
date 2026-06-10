export const PDF_TEMPLATES = [
  {
    id: 'classic',
    label: 'Modelo 1 – Clássico',
    description: 'Layout institucional azul-escuro com seções detalhadas',
  },
  {
    id: 'alianca',
    label: 'Modelo 2 – Aliança',
    description: 'Layout enxuto com destaque de benefício e cronograma',
  },
] as const;

export type PdfTemplateId = (typeof PDF_TEMPLATES)[number]['id'];

export const DEFAULT_PDF_TEMPLATE: PdfTemplateId = 'classic';
