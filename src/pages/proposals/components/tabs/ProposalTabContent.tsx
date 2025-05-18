
import { Button } from "@/components/ui/button";
import { ExtractedData } from "@/lib/types/proposals";
import ModernProposalCard from "@/components/proposals/ModernProposalCard";

interface ProposalTabContentProps {
  formData: Partial<ExtractedData>;
  imagePreview: string | null;
  onReset: () => void;
}

const ProposalTabContent = ({
  formData,
  imagePreview,
  onReset
}: ProposalTabContentProps) => {
  return (
    <>
      <div className="flex justify-end mb-4">
        <Button variant="outline" onClick={onReset}>
          Criar Nova Proposta
        </Button>
      </div>
      <ModernProposalCard
        data={formData}
        imageUrl={imagePreview || undefined}
      />
    </>
  );
};

export default ProposalTabContent;
