
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { ExtractedData, Proposal, CompanyData } from "@/lib/types/proposals";
import { useSaveProposal, useFetchProposals } from "@/hooks/proposals";
import { fetchCnpjData } from "@/lib/api";

import ProposalsHeader from "./components/ProposalsHeader";
import ProposalsTabs from "./components/ProposalsTabs";

const ProposalsContainer = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { saveProposal } = useSaveProposal();
  const { proposals, isLoading: loadingProposals, fetchProposals, deleteProposal } = useFetchProposals();

  const [activeTab, setActiveTab] = useState("upload");
  const [processing, setProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [formData, setFormData] = useState<Partial<ExtractedData>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [generatedProposal, setGeneratedProposal] = useState<boolean>(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string>("");

  // Preencher dados do usuário no formulário
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        clientName: user.name || '',
        clientEmail: user.email || '',
        clientPhone: '', // Preenchido pelo usuário se necessário
      }));
    }
  }, [user]);

  // Auto fetch CNPJ data when extracted
  useEffect(() => {
    const fetchCompanyData = async () => {
      if (formData.cnpj && activeTab === "data") {
        const data = await fetchCnpjData(formData.cnpj);
        if (data) {
          setCompanyData(data);
          
          // Update form with company information
          setFormData(prev => ({
            ...prev,
            clientName: data.company?.name || prev.clientName || '',
            clientEmail: data.emails?.[0]?.address || prev.clientEmail || '',
            clientPhone: data.phones?.[0] ? `${data.phones[0].area}${data.phones[0].number}` : prev.clientPhone || '',
            businessActivity: data.sideActivities?.[0] 
              ? `${data.sideActivities[0].id} | ${data.sideActivities[0].text}`
              : data.mainActivity 
                ? `${data.mainActivity.id} | ${data.mainActivity.text}` 
                : prev.businessActivity || '',
          }));
        }
      }
    };
    
    fetchCompanyData();
  }, [formData.cnpj, activeTab]);

  const handleProcessComplete = (data: Partial<ExtractedData>, preview: string) => {
    setFormData(prev => ({
      ...prev,
      ...data,
      // Make sure entryInstallments is set, defaulting to '1' if not provided
      entryInstallments: data.entryInstallments || prev.entryInstallments || '1',
      // Garantir que os dados do usuário atual sejam mantidos
      clientName: data.clientName || user?.name || prev.clientName || '',
      clientEmail: data.clientEmail || user?.email || prev.clientEmail || '',
    }));
    setImagePreview(preview);
    setActiveTab("data");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateProposal = async () => {
    setGeneratedProposal(true);
    
    // Salvar a proposta no Supabase
    if (formData) {
      const proposal = await saveProposal(formData as ExtractedData, imagePreview || undefined);
      
      if (proposal) {
        // Em caso de sucesso, atualize a lista de propostas
        fetchProposals();
        setSelectedProposal(proposal);
        toast({
          title: "Proposta gerada",
          description: "Sua proposta foi gerada e armazenada com sucesso!"
        });
      }
    }
    
    setActiveTab("proposal");
  };

  const handleViewProposal = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setFormData(proposal.data);
    setImagePreview(proposal.imageUrl);
    setGeneratedProposal(true);
    setActiveTab("proposal");
    
    // Fetch company data for this proposal
    if (proposal.data.cnpj) {
      fetchCnpjData(proposal.data.cnpj)
        .then(data => {
          if (data) {
            setCompanyData(data);
          }
        })
        .catch(err => console.error("Error fetching company data:", err));
    }
  };

  const handleDeleteProposal = async (id: string) => {
    const success = await deleteProposal(id);
    
    // Se a proposta excluída era a selecionada, limpar o state
    if (success && selectedProposal?.id === id) {
      setSelectedProposal(null);
      setGeneratedProposal(false);
      setFormData({});
      setImagePreview(null);
      setCompanyData(null);
      setActiveTab("upload");
    }
    
    return success;
  };

  const handleReset = () => {
    setFormData({
      clientName: user?.name || '',
      clientEmail: user?.email || '',
      clientPhone: '',
    });
    setImagePreview(null);
    setGeneratedProposal(false);
    setSelectedProposal(null);
    setCompanyData(null);
    setActiveTab("upload");
  };

  return (
    <div className="container py-6">
      <ProposalsHeader />
      
      <ProposalsTabs 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        formData={formData}
        generatedProposal={generatedProposal}
        processing={processing}
        setProcessing={setProcessing}
        progressPercent={progressPercent}
        setProgressPercent={setProgressPercent}
        companyData={companyData}
        imagePreview={imagePreview}
        selectedProposal={selectedProposal}
        proposals={proposals}
        loadingProposals={loadingProposals}
        onInputChange={handleInputChange}
        onGenerateProposal={handleGenerateProposal}
        onViewProposal={handleViewProposal}
        onDeleteProposal={handleDeleteProposal}
        onProcessComplete={handleProcessComplete}
        onReset={handleReset}
        setProcessingStatus={setProcessingStatus}
      />
    </div>
  );
};

export default ProposalsContainer;
