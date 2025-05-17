
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, FileText, Trash2 } from "lucide-react";
import { Proposal } from "@/lib/types/proposals";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";

interface ProposalHistoryProps {
  proposals: Proposal[];
  onViewProposal: (proposal: Proposal) => void;
  onDeleteProposal: (id: string) => void;
}

const ProposalHistory = ({ proposals, onViewProposal, onDeleteProposal }: ProposalHistoryProps) => {
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDeleteProposal(id);
      toast({
        title: "Proposta excluída",
        description: "A proposta foi removida com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a proposta.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (proposals.length === 0) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Histórico de Propostas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-40" />
            <p className="mt-4 text-muted-foreground">Nenhuma proposta gerada ainda.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Histórico de Propostas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Data</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">CNPJ</th>
                <th className="text-right py-2 px-3 text-sm font-medium text-muted-foreground">Valor</th>
                <th className="text-right py-2 px-3 text-sm font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {proposals.map((proposal) => (
                <tr key={proposal.id} className="border-b hover:bg-muted/30">
                  <td className="py-2 px-3 text-sm">{formatDate(proposal.createdAt)}</td>
                  <td className="py-2 px-3 text-sm">{proposal.data.cnpj}</td>
                  <td className="py-2 px-3 text-sm text-right">R$ {proposal.data.totalDebt}</td>
                  <td className="py-2 px-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onViewProposal(proposal)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(proposal.id)}
                        disabled={deletingId === proposal.id}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProposalHistory;
