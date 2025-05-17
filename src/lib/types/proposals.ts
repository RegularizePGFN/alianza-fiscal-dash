
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
}

export interface Proposal {
  id: string;
  userId: string;
  userName: string;
  createdAt: string;
  data: ExtractedData;
  imageUrl: string;
}
