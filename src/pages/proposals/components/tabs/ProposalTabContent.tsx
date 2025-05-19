
import { ExtractedData, CompanyData } from "@/lib/types/proposals";
import ProposalCard from "@/components/proposals/card/ProposalCard";
import CompanyDataDetails from "@/components/proposals/card/client/CompanyDataDetails";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface ProposalTabContentProps {
  formData: Partial<ExtractedData>;
  imagePreview: string | null;
  companyData?: CompanyData | null;
  onReset: () => void;
}

const ProposalTabContent = ({ formData, imagePreview, companyData, onReset }: ProposalTabContentProps) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Proposta Gerada</h2>
        <Button variant="outline" onClick={onReset}>
          <RefreshCw className="mr-2 h-4 w-4" /> Nova Proposta
        </Button>
      </div>
      
      {companyData && (
        <Card className="p-4 mb-4">
          <h3 className="font-medium text-lg mb-3">Dados do CNPJ</h3>
          <CompanyDataDetails companyData={companyData} />
        </Card>
      )}

      <ProposalCard data={formData} companyData={companyData} />
    </div>
  );
};

export default ProposalTabContent;
