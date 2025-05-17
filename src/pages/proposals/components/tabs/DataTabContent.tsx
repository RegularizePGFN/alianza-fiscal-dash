
import { ExtractedData } from "@/lib/types/proposals";
import DataForm from "@/components/proposals/DataForm";

interface DataTabContentProps {
  formData: Partial<ExtractedData>;
  processing: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerateProposal: () => void;
  setProcessingStatus: (status: string) => void;
}

const DataTabContent = ({
  formData,
  processing,
  onInputChange,
  onGenerateProposal,
  setProcessingStatus
}: DataTabContentProps) => {
  return (
    <DataForm
      formData={formData}
      processing={processing}
      onInputChange={onInputChange}
      onGenerateProposal={onGenerateProposal}
      setProcessingStatus={setProcessingStatus}
    />
  );
};

export default DataTabContent;
