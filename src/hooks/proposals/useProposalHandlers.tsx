
import { useFormHandlers } from "./useFormHandlers";
import { useProposalGeneration } from "./useProposalGeneration";
import { useProposalActions } from "./useProposalActions";
import { ExtractedData, Proposal, CompanyData } from "@/lib/types/proposals";

interface UseProposalHandlersProps {
  formData: Partial<ExtractedData>;
  setFormData: (formData: Partial<ExtractedData> | ((prev: Partial<ExtractedData>) => Partial<ExtractedData>)) => void;
  imagePreview: string | null;
  setImagePreview: (preview: string | null) => void;
  setGeneratedProposal: (generated: boolean) => void;
  selectedProposal: Proposal | null;
  setSelectedProposal: (proposal: Proposal | null) => void;
  setActiveTab: (tab: string) => void;
  setCompanyData: (data: CompanyData | null) => void;
  saveProposal: (data: ExtractedData, imageUrl?: string | undefined) => Promise<Proposal | null>;
  fetchProposals: () => Promise<void>;
  deleteProposal: (id: string) => Promise<boolean>;
  user: any;
}

export const useProposalHandlers = (props: UseProposalHandlersProps) => {
  // Get form handling functions
  const { handleProcessComplete, handleInputChange } = useFormHandlers({
    formData: props.formData,
    setFormData: props.setFormData,
    setImagePreview: props.setImagePreview,
    setActiveTab: props.setActiveTab,
    setCompanyData: props.setCompanyData,
    user: props.user
  });

  // Get proposal generation functions
  const { handleGenerateProposal, handleViewProposal } = useProposalGeneration({
    formData: props.formData,
    setFormData: props.setFormData,
    imagePreview: props.imagePreview,
    setImagePreview: props.setImagePreview,
    setGeneratedProposal: props.setGeneratedProposal,
    setActiveTab: props.setActiveTab,
    setCompanyData: props.setCompanyData,
    setSelectedProposal: props.setSelectedProposal,
    saveProposal: props.saveProposal,
    fetchProposals: props.fetchProposals,
    user: props.user
  });

  // Get proposal actions functions
  const { handleDeleteProposal, handleReset } = useProposalActions({
    setFormData: props.setFormData,
    setImagePreview: props.setImagePreview,
    setGeneratedProposal: props.setGeneratedProposal,
    selectedProposal: props.selectedProposal,
    setSelectedProposal: props.setSelectedProposal,
    setActiveTab: props.setActiveTab,
    setCompanyData: props.setCompanyData,
    deleteProposal: props.deleteProposal,
    user: props.user
  });

  return {
    handleProcessComplete,
    handleInputChange,
    handleGenerateProposal,
    handleViewProposal,
    handleDeleteProposal,
    handleReset
  };
};
