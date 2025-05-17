
import { Button } from "@/components/ui/button";
import { ExtractedData } from "@/lib/types/proposals";
import { ProposalCard } from "@/components/proposals/card";

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
      <ProposalCard
        data={formData}
        imageUrl={imagePreview || undefined}
      />
    </>
  );
};

export default ProposalTabContent;
