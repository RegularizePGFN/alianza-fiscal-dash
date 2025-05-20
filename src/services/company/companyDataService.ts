
import { fetchCnpjData } from "@/lib/api";
import { CompanyData } from "@/lib/types/proposals";

/**
 * Fetches company data by CNPJ
 * @param cnpj The CNPJ to look up
 * @param setStatus Optional callback to update processing status
 * @returns Promise with the company data or null if not found
 */
export async function fetchCompanyDataByCnpj(
  cnpj: string,
  setStatus?: (status: string) => void
): Promise<CompanyData | null> {
  if (!cnpj || cnpj.length < 14) {
    return null;
  }
  
  try {
    if (setStatus) setStatus("Consultando dados do CNPJ...");
    
    const data = await fetchCnpjData(cnpj);
    return data || null;
  } catch (error) {
    console.error("Erro ao buscar dados do CNPJ:", error);
    throw new Error(`Falha ao consultar dados do CNPJ: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  } finally {
    if (setStatus) setStatus("");
  }
}

/**
 * Extracts contact information from company data
 * @param companyData The company data to extract from
 * @returns Object with email, phone, and business activity
 */
export function extractCompanyContactInfo(companyData: CompanyData | null) {
  if (!companyData) return { email: '', phone: '', activity: '' };
  
  const email = companyData.emails?.[0]?.address || '';
  const phone = companyData.phones?.[0] ? `${companyData.phones[0].area}${companyData.phones[0].number}` : '';
  const activity = companyData.mainActivity 
    ? `${companyData.mainActivity.id} | ${companyData.mainActivity.text}` 
    : companyData.sideActivities?.[0]
      ? `${companyData.sideActivities[0].id} | ${companyData.sideActivities[0].text}`
      : '';
  
  return { email, phone, activity };
}

/**
 * Formats a company address for display
 */
export function formatCompanyAddress(address?: CompanyData['address']): string {
  if (!address) return "";
  
  const parts = [
    address.street,
    address.number ? `Nº ${address.number}` : "",
    address.details || "",
    address.district ? `${address.district}` : "",
    address.city && address.state ? `${address.city}/${address.state}` : "",
    address.zip ? `CEP: ${address.zip}` : ""
  ];
  
  return parts.filter(part => part).join(", ");
}

/**
 * Formats a date to Brazilian format
 */
export function formatBrazilianDate(dateString?: string): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  } catch (e) {
    return dateString;
  }
}
