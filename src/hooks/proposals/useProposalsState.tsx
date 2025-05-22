
import { useState, useEffect } from "react";
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
    fetchProposals,
    deleteProposal
  } = useFetchProposals();
  
  // State management
  const [activeTab, setActiveTab] = useState("upload");
  const [processing, setProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [formData, setFormData] = useState<Partial<ExtractedData>>({
    // Default values for the new fields
    feesAdditionalPercentage: '20',
    feesInstallments: '3',
    feesPaymentMethod: 'cartao',
    entryInstallments: '1',
    showFeesInstallments: 'false'
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [generatedProposal, setGeneratedProposal] = useState<boolean>(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  
  // Fetch proposals when component mounts
  useEffect(() => {
    fetchProposals();
  }, []);
  
  // Use our custom hooks
  const { fetchCompanyDataByCnpj } = useFetchCompanyData({ 
    formData, 
    setFormData, 
    setCompanyData, 
    setProcessingStatus 
  });
  
  const { calculateFees, calculateInstallmentFees } = useFeesCalculation({ formData, setFormData });
  const { generatePaymentDates } = useDatesHandling({ activeTab, formData, setFormData });
  useTemplateDefaults({ setFormData });
  useUserData({ user, setFormData });
  
  // Automatically fetch CNPJ data whenever formData.cnpj changes
  useEffect(() => {
    if (formData.cnpj && formData.cnpj.length >= 14) {
      fetchCompanyDataByCnpj(formData.cnpj);
    }
  }, [formData.cnpj]);
  
  // Recalculate installment fees when needed
  useEffect(() => {
    if (formData.feesValue && formData.feesAdditionalPercentage && formData.feesInstallments) {
      calculateInstallmentFees();
    }
  }, [formData.feesValue, formData.feesAdditionalPercentage, formData.feesInstallments]);
  
  // Generate payment dates when needed
  useEffect(() => {
    if (activeTab === 'proposal' && formData.entryValue && formData.installmentValue && formData.installments) {
      generatePaymentDates();
    }
  }, [activeTab, formData.entryValue, formData.entryInstallments, formData.installmentValue, formData.installments]);

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
