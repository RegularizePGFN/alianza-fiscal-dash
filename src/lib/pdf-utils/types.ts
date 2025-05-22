
import { ExtractedData, CompanyData } from '../types/proposals';

// PDF generation specific types
export type PageContent = {
  html: string;
  pageNumber: number;
  totalPages: number;
};

export type RenderOptions = {
  scale?: number;
  backgroundColor?: string;
  useCORS?: boolean;
  logging?: boolean;
  allowTaint?: boolean;
};

export type {
  ExtractedData,
  CompanyData
};
