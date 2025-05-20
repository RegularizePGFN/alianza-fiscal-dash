
import { useState } from "react";
import { fetchCnpjData } from "@/lib/api";
import { ExtractedData, CompanyData } from "@/lib/types/proposals";
import { useToast } from "@/hooks/use-toast";

interface UseFetchCompanyDataProps {
  formData: Partial<ExtractedData>;
  setFormData: (formData: Partial<ExtractedData> | ((prev: Partial<ExtractedData>) => Partial<ExtractedData>)) => void;
  setCompanyData: (data: CompanyData | null) => void;
  setProcessingStatus: (status: string) => void;
}

export const useFetchCompanyData = ({
  formData,
  setFormData,
  setCompanyData,
  setProcessingStatus
}: UseFetchCompanyDataProps) => {
  const { toast } = useToast();
  
  const fetchCompanyDataByCnpj = async (cnpj: string) => {
    if (cnpj && cnpj.length >= 14) {
      setProcessingStatus("Consultando dados do CNPJ...");
      try {
        const data = await fetchCnpjData(cnpj);
        if (data) {
          setCompanyData(data);

          // Update form with company information
          setFormData(prev => ({
            ...prev,
            clientName: data.company?.name || prev.clientName || '',
            clientEmail: data.emails?.[0]?.address || prev.clientEmail || '',
            clientPhone: data.phones?.[0] ? `${data.phones[0].area}${data.phones[0].number}` : prev.clientPhone || '',
            businessActivity: data.sideActivities?.[0] ? `${data.sideActivities[0].id} | ${data.sideActivities[0].text}` : data.mainActivity ? `${data.mainActivity.id} | ${data.mainActivity.text}` : prev.businessActivity || ''
          }));
          toast({
            title: "Dados da empresa obtidos",
            description: `Informações de ${data.company?.name} preenchidas automaticamente.`
          });
        }
      } catch (error) {
        console.error("Erro ao buscar dados do CNPJ:", error);
      } finally {
        setProcessingStatus("");
      }
    }
  };

  return {
    fetchCompanyDataByCnpj
  };
};
