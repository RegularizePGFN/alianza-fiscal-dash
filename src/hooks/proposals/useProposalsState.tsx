
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { ExtractedData, Proposal, CompanyData } from "@/lib/types/proposals";
import { useSaveProposal, useFetchProposals } from "@/hooks/proposals";
import { fetchCnpjData } from "@/lib/api";

export const useProposalsState = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { saveProposal } = useSaveProposal();
  const {
    proposals,
    isLoading: loadingProposals,
    fetchProposals,
    deleteProposal
  } = useFetchProposals();
  
  const [activeTab, setActiveTab] = useState("upload");
  const [processing, setProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [formData, setFormData] = useState<Partial<ExtractedData>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [generatedProposal, setGeneratedProposal] = useState<boolean>(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string>("");

  // Fetch proposals when component mounts
  useEffect(() => {
    fetchProposals();
  }, []);

  // Preencher dados do usuário no formulário
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        clientName: user.name || '',
        clientEmail: user.email || '',
        clientPhone: '' // Preenchido pelo usuário se necessário
      }));
    }
  }, [user]);

  // Automatically fetch CNPJ data whenever formData.cnpj changes
  useEffect(() => {
    const fetchCompanyData = async () => {
      if (formData.cnpj && formData.cnpj.length >= 14) {
        setProcessingStatus("Consultando dados do CNPJ...");
        try {
          const data = await fetchCnpjData(formData.cnpj);
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
    fetchCompanyData();
  }, [formData.cnpj]);

  // Calculate fees whenever totalDebt or discountedValue changes
  useEffect(() => {
    if (formData.totalDebt && formData.discountedValue) {
      try {
        const totalDebtValue = parseFloat(formData.totalDebt.replace(/\./g, '').replace(',', '.'));
        const discountedValue = parseFloat(formData.discountedValue.replace(/\./g, '').replace(',', '.'));
        if (!isNaN(totalDebtValue) && !isNaN(discountedValue)) {
          const economyValue = totalDebtValue - discountedValue;
          const feesValue = economyValue * 0.2; // 20% of the savings

          // Format with exactly 2 decimal places
          const formattedValue = feesValue.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          });

          setFormData(prev => ({
            ...prev,
            feesValue: formattedValue
          }));
        }
      } catch (error) {
        console.error("Error calculating fees:", error);
      }
    }
  }, [formData.totalDebt, formData.discountedValue]);

  return {
    // State
    activeTab,
    setActiveTab,
    processing,
    setProcessing,
    progressPercent,
    setProgressPercent,
    formData,
    setFormData,
    imagePreview,
    setImagePreview,
    generatedProposal,
    setGeneratedProposal,
    selectedProposal,
    setSelectedProposal,
    companyData,
    setCompanyData,
    processingStatus,
    setProcessingStatus,
    
    // External state
    user,
    proposals,
    loadingProposals,
    
    // Methods from other hooks
    saveProposal,
    fetchProposals,
    deleteProposal,
  };
};
