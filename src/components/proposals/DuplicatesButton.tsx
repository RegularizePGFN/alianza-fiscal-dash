
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Trash2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DuplicateGroup {
  cnpj: string;
  total_debt: number;
  count: number;
  latest_created_at: string;
}

export function DuplicatesButton() {
  const [duplicatesCount, setDuplicatesCount] = useState<number>(0);
  const [isScanning, setIsScanning] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const { toast } = useToast();

  const scanForDuplicates = async () => {
    setIsScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke('scan-duplicate-proposals');
      
      if (error) {
        console.error('Error scanning duplicates:', error);
        // Fallback to manual query if edge function fails
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('proposals')
          .select('cnpj, total_debt, created_at')
          .not('cnpj', 'is', null)
          .not('total_debt', 'is', null);
        
        if (fallbackError) throw fallbackError;
        
        // Group duplicates manually
        const grouped = (fallbackData || []).reduce((acc, proposal) => {
          const key = `${proposal.cnpj}-${proposal.total_debt}`;
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(proposal);
          return acc;
        }, {} as Record<string, any[]>);
        
        const duplicateGroups = Object.entries(grouped)
          .filter(([_, proposals]) => proposals.length > 1);
        
        setDuplicatesCount(duplicateGroups.length);
      } else {
        const duplicateGroups = data as DuplicateGroup[];
        setDuplicatesCount(duplicateGroups.length);
      }
      
      setHasScanned(true);
      toast({
        title: "Escaneamento concluído",
        description: duplicatesCount > 0 
          ? `Encontrados ${duplicatesCount} grupos de propostas duplicadas`
          : "Nenhuma duplicata encontrada",
      });
    } catch (error: any) {
      console.error('Error scanning for duplicates:', error);
      toast({
        title: "Erro ao escanear duplicatas",
        description: error.message || "Não foi possível escanear as propostas",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const cleanDuplicates = async () => {
    setIsCleaning(true);
    try {
      const { data, error } = await supabase.rpc('clean_duplicate_proposals');
      
      if (error) throw error;
      
      const result = data?.[0];
      if (result) {
        toast({
          title: "Limpeza concluída",
          description: result.details,
        });
        
        // Reset state after cleaning
        setDuplicatesCount(0);
        setHasScanned(false);
      }
    } catch (error: any) {
      console.error('Error cleaning duplicates:', error);
      toast({
        title: "Erro ao limpar duplicatas",
        description: error.message || "Não foi possível limpar as propostas duplicadas",
        variant: "destructive",
      });
    } finally {
      setIsCleaning(false);
    }
  };

  const handleClick = () => {
    if (hasScanned && duplicatesCount > 0) {
      cleanDuplicates();
    } else {
      scanForDuplicates();
    }
  };

  const getButtonVariant = () => {
    if (hasScanned && duplicatesCount > 0) {
      return "destructive";
    }
    return "outline";
  };

  const getButtonText = () => {
    if (isCleaning) return "Excluindo...";
    if (hasScanned && duplicatesCount > 0) return "Excluir Duplicatas";
    if (isScanning) return "Escaneando...";
    return "Escanear Duplicatas";
  };

  const getButtonIcon = () => {
    if (isCleaning || isScanning) {
      return <RefreshCw className="h-4 w-4 animate-spin" />;
    }
    if (hasScanned && duplicatesCount > 0) {
      return <Trash2 className="h-4 w-4" />;
    }
    return <RefreshCw className="h-4 w-4" />;
  };

  return (
    <div className="relative">
      <Button 
        onClick={handleClick}
        disabled={isScanning || isCleaning}
        variant={getButtonVariant()}
        size="sm"
        className="flex items-center gap-2"
      >
        {getButtonIcon()}
        {getButtonText()}
      </Button>
      
      {/* Indicator badge */}
      {hasScanned && (
        <Badge 
          className={`absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs ${
            duplicatesCount > 0 
              ? 'bg-red-500 text-white' 
              : 'bg-green-500 text-white'
          }`}
        >
          {duplicatesCount > 0 ? (
            duplicatesCount
          ) : (
            <CheckCircle className="h-3 w-3" />
          )}
        </Badge>
      )}
    </div>
  );
}
