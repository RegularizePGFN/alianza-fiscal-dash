export interface ExtractedData {
  cnpj: string;
  totalDebt: string;
  discountedValue: string;
  discountPercentage: string;
  entryValue: string;
  entryInstallments: string;
  installments: string;
  installmentValue: string;
  debtNumber: string;
  feesValue: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  businessActivity?: string;
  creationDate?: string;
  validityDate?: string;
  specialistName?: string; // Name of the tax specialist (usually the current user)
  templateId?: string; // ID of the selected template for PDF rendering
  templateColors?: string; // JSON string representation of colors
  templateLayout?: string; // JSON string representation of layout
}

export interface Proposal {
  id: string;
  userId: string;
  userName: string;
  createdAt: string;
  data: ExtractedData;
  imageUrl: string;
  creationDate?: string;
  validityDate?: string;
  specialistName?: string; // Added for direct access
  templateId?: string;     // Added for direct access
}

export interface CompanyData {
  taxId: string;
  company: {
    name: string;
    equity?: number;
    nature?: {
      id: number;
      text: string;
    };
    size?: {
      id: number;
      acronym: string;
      text: string;
    };
  };
  alias?: string | null;
  founded?: string;
  head?: boolean;
  statusDate?: string;
  status?: {
    id: number;
    text: string;
  };
  address?: {
    municipality?: number;
    street?: string;
    number?: string;
    details?: string | null;
    district?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: {
      id: number;
      name: string;
    };
  };
  phones?: {
    area: string;
    number: string;
    type?: string;
  }[];
  emails?: {
    address: string;
    ownership?: string;
    domain?: string;
  }[];
  sideActivities?: {
    id: number;
    text: string;
  }[];
  mainActivity?: {
    id: number;
    text: string;
  };
}

// Adicionando um novo tipo para a resposta da API de visão da OpenAI
export interface AIVisionResponse {
  cnpj: string;
  numero_processo: string;
  valor_total_sem_reducao: string;
  valor_total_com_reducao: string;
  percentual_de_reducao: string;
  valor_da_entrada_total: string;
  entrada_parcelada: {
    quantidade_parcelas: number;
    valor_parcela: string;
  };
  parcelamento_principal: {
    quantidade_parcelas: number;
    valor_parcela: string;
  };
}

// Template colors interface for parsed templateColors
export interface TemplateColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
}

// Template layout interface for parsed templateLayout
export interface TemplateLayout {
  sections: string[];
  showHeader: boolean;
  showWatermark: boolean;
  showLogo: boolean;
}

// New PDF template interface
export interface PDFTemplate {
  id: string;
  name: string;
  description: string;
  preview: string; // URL to preview image
  primaryColor: string; 
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  headerImage?: string;
  watermarkImage?: string;
  defaultLayout: string[]; // Default section order, e.g. ["client", "debt", "negotiation"]
}
