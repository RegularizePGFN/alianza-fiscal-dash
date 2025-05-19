
import { Button } from "@/components/ui/button";
import { FileText, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/auth";

interface ProposalsHeaderProps {
  onClickNew: () => void;
  onClickRefresh: () => void;
  isLoading?: boolean;
}

const ProposalsHeader = ({ onClickNew, onClickRefresh, isLoading }: ProposalsHeaderProps) => {
  const { user } = useAuth();
  
  return (
    <div className="proposal-gradient-header">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText size={24} className="text-white" />
          <div>
            <h1 className="text-2xl font-bold text-white">Propostas</h1>
            <p className="text-sm text-white/90">
              Crie, gerencie e exporte propostas de parcelamento PGFN.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onClickRefresh}
            className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:text-white"
            disabled={isLoading}
          >
            <RefreshCw size={16} className={`mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          
          <Button
            onClick={onClickNew}
            size="sm"
            className="bg-white text-primary hover:bg-white/90"
          >
            Nova Proposta
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProposalsHeader;
