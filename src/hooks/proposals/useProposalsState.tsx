
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { ExtractedData, Proposal, CompanyData } from "@/lib/types/proposals";
import { useSaveProposal, useFetchProposals } from "@/hooks/proposals";
import { useFetchCompanyData } from "./useFetchCompanyData";
import { useFeesCalculation } from "./useFeesCalculation";
import { useDatesHandling } from "./useDatesHandling";
import { useTemplateDefaults } from "./useTemplateDefaults";
import { useUserData } from "./useUserData";

export const useProposalsState = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { saveProposal } = useSaveProposal();
  const {
    proposals,
    isLoading: loadingProposals,
    fetchProposals: fetchProposalsOriginal,
    deleteProposal
  } = useFetchProposals();
  
  // ✅ Wrap fetchProposals with useCallback to ensure stable reference
  const fetchProposals = useCallback(async () => {
    console.log("fetchProposals called from useProposalsState");
    await fetchProposalsOriginal();
  }, [fetchProposalsOriginal]);
  
  // State management
  const [activeTab, setActiveTab] = useState("upload");
  const [processing, setProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [formData, setFormData] = useState<Partial<ExtractedData>>({
    // Default values for fee installments
    feesInstallments: '2',
    feesPaymentMethod: 'cartao',
    entryInstallments: '1',
    showFeesInstallments: 'false',
    // Default values for executive data
    includeExecutiveData: 'true',
    executiveName: user?.name || '',
    executiveEmail: user?.email || '',
    executivePhone: ''
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [generatedProposal, setGeneratedProposal] = useState<boolean>(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  
  // Update executive data when user changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        executiveName: user.name || '',
        executiveEmail: user.email || ''
      }));
    }
  }, [user]);
  
  // Use our custom hooks
  const { fetchCompanyDataByCnpj } = useFetchCompanyData({ 
    formData, 
    setFormData, 
    setCompanyData, 
    setProcessingStatus 
  });
  
  const { calculateFees, calculateInstallmentFeesTotal, calculateInstallmentValue } = useFeesCalculation({ formData, setFormData });
  const { generatePaymentDates } = useDatesHandling({ activeTab, formData, setFormData });
  useTemplateDefaults({ setFormData });
  useUserData({ user, setFormData });
  
  // Automatically fetch CNPJ data whenever formData.cnpj changes
  useEffect(() => {
    if (formData.cnpj && formData.cnpj.length >= 14) {
      fetchCompanyDataByCnpj(formData.cnpj);
    }
  }, [formData.cnpj, fetchCompanyDataByCnpj]);
  
  // Generate payment dates when needed
  useEffect(() => {
    if (activeTab === 'proposal' && formData.entryValue && formData.installmentValue && formData.installments) {
      generatePaymentDates();
    }
  }, [activeTab, formData.entryValue, formData.entryInstallments, formData.installmentValue, formData.installments, generatePaymentDates]);

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
