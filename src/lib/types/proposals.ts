
export interface ExtractedData {
  cnpj: string;
  totalDebt: string;
  discountedValue: string;
  discountPercentage: string;
  entryValue: string;
  installments: string;
  installmentValue: string;
  debtNumber: string;
  feesValue: string;
  entryInstallments: string; // New field for entry payment installments
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  businessActivity?: string;
}

export interface Proposal {
  id: string;
  userId: string;
  userName: string;
  createdAt: string;
  data: ExtractedData;
  imageUrl: string;
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
