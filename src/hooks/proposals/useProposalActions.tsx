
import { ExtractedData, Proposal } from "@/lib/types/proposals";
import { useToast } from "@/hooks/use-toast";

interface UseProposalActionsProps {
  setFormData: (formData: Partial<ExtractedData> | ((prev: Partial<ExtractedData>) => Partial<ExtractedData>)) => void;
  setImagePreview: (preview: string | null) => void;
  setGeneratedProposal: (generated: boolean) => void;
  selectedProposal: Proposal | null;
  setSelectedProposal: (proposal: Proposal | null) => void;
  setActiveTab: (tab: string) => void;
  setCompanyData: (data: any) => void;
  deleteProposal: (id: string) => Promise<boolean>;
  user: any;
}

export const useProposalActions = ({
  setFormData,
  setImagePreview,
  setGeneratedProposal,
  selectedProposal,
  setSelectedProposal,
  setActiveTab,
  setCompanyData,
  deleteProposal,
  user,
}: UseProposalActionsProps) => {
  const { toast } = useToast();
  
  const handleDeleteProposal = async (id: string): Promise<boolean> => {
    const success = await deleteProposal(id);

    // If the deleted proposal was selected, clear the state
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
      // Não usar o nome do usuário para clientName
      clientName: '',
      clientEmail: user?.email || '',
      clientPhone: '',
      specialistName: user?.name || '',
      templateId: 'default',
      templateColors: JSON.stringify({
        primary: '#3B82F6',
        secondary: '#1E40AF',
        accent: '#10B981',
        background: '#F8FAFC'
      }),
      templateLayout: JSON.stringify({
        sections: ['client', 'debt', 'payment', 'fees'],
        showHeader: true,
        showLogo: true,
        showWatermark: false
      })
    });
    setImagePreview(null);
    setGeneratedProposal(false);
    setSelectedProposal(null);
    setCompanyData(null);
    setActiveTab("upload");
  };

  return {
    handleDeleteProposal,
    handleReset
  };
};
