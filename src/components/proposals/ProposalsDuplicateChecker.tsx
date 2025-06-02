
import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProposalsDuplicateCheckerProps {
  proposals: any[];
}

export function ProposalsDuplicateChecker({ proposals }: ProposalsDuplicateCheckerProps) {
  const [duplicateCount, setDuplicateCount] = useState<number>(0);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    checkForDuplicates();
  }, [proposals]);

  const checkForDuplicates = async () => {
    setIsChecking(true);
    try {
      // Group proposals by CNPJ + total_debt
      const grouped = proposals.reduce((acc, proposal) => {
        if (proposal.data.cnpj && proposal.data.totalDebt) {
          const key = `${proposal.data.cnpj}-${proposal.data.totalDebt}`;
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(proposal);
        }
        return acc;
      }, {} as Record<string, any[]>);

      // Count groups with more than 1 proposal
      const duplicateGroups = Object.values(grouped).filter(group => group.length > 1);
      setDuplicateCount(duplicateGroups.length);
    } catch (error) {
      console.error('Error checking for duplicates:', error);
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return null; // Don't show anything while checking
  }

  if (duplicateCount === 0) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Todas as propostas são únicas. Sistema de prevenção de duplicatas ativo.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-orange-200 bg-orange-50">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-800">
        <strong>Atenção:</strong> {duplicateCount} grupos de propostas duplicadas detectados.
        O sistema automaticamente manterá apenas a versão mais recente de cada proposta.
      </AlertDescription>
    </Alert>
  );
}
