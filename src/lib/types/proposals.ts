
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
