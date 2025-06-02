
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { ExtractedData, Proposal, CompanyData } from "@/lib/types/proposals";
import { useSaveProposal } from "@/hooks/proposals";
import { useFetchProposalsWithFilter } from "./useFetchProposalsWithFilter";
import { useFetchCompanyData } from "./useFetchCompanyData";
import { useFeesCalculation } from "./useFeesCalculation";
import { useDatesHandling } from "./useDatesHandling";
import { useTemplateDefaults } from "./useTemplateDefaults";
import { useUserData } from "./useUserData";
import { DateFilterType, DateRange } from "@/components/proposals/ProposalsDateFilter";

export const useProposalsStateWithFilter = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { saveProposal } = useSaveProposal();
  const {
    proposals,
    isLoading: loadingProposals,
    fetchProposals,
    deleteProposal
  } = useFetchProposalsWithFilter();
  
  // Date filter state
  const [filterType, setFilterType] = useState<DateFilterType>('last7days');
  const [customDateRange, setCustomDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  
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
  
  // Fetch proposals when component mounts or filter changes
  useEffect(() => {
    fetchProposals(filterType, filterType === 'custom' ? customDateRange : undefined);
  }, [fetchProposals, filterType, customDateRange]);
  
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
  
  // Handle filter changes
  const handleFilterChange = (type: DateFilterType, range?: DateRange) => {
    setFilterType(type);
    if (type === 'custom' && range) {
      setCustomDateRange(range);
    } else if (type !== 'custom') {
      setCustomDateRange({ from: undefined, to: undefined });
    }
  };

  // Refresh proposals with current filter
  const refreshProposals = () => {
    fetchProposals(filterType, filterType === 'custom' ? customDateRange : undefined);
  };
  
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
    
    // Filter state
    filterType,
    customDateRange,
    handleFilterChange,
    
    // External state
    user,
    proposals,
    loadingProposals,
    
    // Methods from other hooks
    saveProposal,
    fetchProposals: refreshProposals,
    deleteProposal,
  };
};
