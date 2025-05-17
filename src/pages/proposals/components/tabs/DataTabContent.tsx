
import { ExtractedData } from "@/lib/types/proposals";
import DataForm from "@/components/proposals/DataForm";

interface DataTabContentProps {
  formData: Partial<ExtractedData>;
  processing: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerateProposal: () => void;
}

const DataTabContent = ({
  formData,
  processing,
  onInputChange,
  onGenerateProposal
}: DataTabContentProps) => {
  return (
    <DataForm
      formData={formData}
      processing={processing}
      onInputChange={onInputChange}
      onGenerateProposal={onGenerateProposal}
    />
  );
};

export default DataTabContent;
