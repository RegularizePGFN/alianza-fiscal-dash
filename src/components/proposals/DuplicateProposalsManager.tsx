
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Trash2, RefreshCw, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DuplicateGroup {
  cnpj: string;
  total_debt: number;
  count: number;
  latest_created_at: string;
}

export function DuplicateProposalsManager() {
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const { toast } = useToast();

  const scanForDuplicates = async () => {
    setIsScanning(true);
    try {
      const { data, error } = await supabase.rpc('scan_duplicate_proposals');
      
      if (error) {
        console.error('Error scanning duplicates:', error);
        // Fallback to manual query if RPC fails
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('proposals')
          .select('cnpj, total_debt, created_at')
          .not('cnpj', 'is', null)
          .not('total_debt', 'is', null);
        
        if (fallbackError) throw fallbackError;
        
        // Group duplicates manually
        const grouped = fallbackData.reduce((acc, proposal) => {
          const key = `${proposal.cnpj}-${proposal.total_debt}`;
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(proposal);
          return acc;
        }, {} as Record<string, any[]>);
        
        const duplicateGroups = Object.entries(grouped)
          .filter(([_, proposals]) => proposals.length > 1)
          .map(([key, proposals]) => {
            const [cnpj, total_debt] = key.split('-');
            return {
              cnpj,
              total_debt: parseFloat(total_debt),
              count: proposals.length,
              latest_created_at: proposals.sort((a, b) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              )[0].created_at
            };
          });
        
        setDuplicates(duplicateGroups);
      } else {
        setDuplicates(data || []);
      }
      
      toast({
        title: "Escaneamento concluído",
        description: `Encontradas ${duplicates.length} grupos de propostas duplicadas`,
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
        
        // Refresh the duplicates list
        await scanForDuplicates();
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="border-orange-200 shadow-md rounded-xl bg-white">
      <CardHeader className="border-b border-orange-100 bg-gradient-to-r from-orange-50 to-white">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          Gerenciador de Propostas Duplicadas
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex gap-3 mb-6">
          <Button 
            onClick={scanForDuplicates}
            disabled={isScanning}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Escaneando...' : 'Escanear Duplicatas'}
          </Button>
          
          {duplicates.length > 0 && (
            <Button 
              onClick={cleanDuplicates}
              disabled={isCleaning}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {isCleaning ? 'Limpando...' : `Limpar ${duplicates.length} Grupos`}
            </Button>
          )}
        </div>

        {duplicates.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma duplicata encontrada
            </h3>
            <p className="text-gray-500">
              {isScanning ? 'Escaneando propostas...' : 'Clique em "Escanear Duplicatas" para verificar'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">
                Grupos de Propostas Duplicadas
              </h3>
              <Badge variant="destructive">
                {duplicates.length} grupos encontrados
              </Badge>
            </div>
            
            <div className="space-y-3">
              {duplicates.map((group, index) => (
                <div 
                  key={index}
                  className="border border-orange-200 rounded-lg p-4 bg-orange-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">CNPJ:</span>
                        <span className="font-mono text-sm">{group.cnpj}</span>
                        <Badge variant="secondary">{group.count} propostas</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Valor Consolidado:</span>
                        <span className="text-green-600 font-semibold">
                          {formatCurrency(group.total_debt)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Mais recente: {formatDate(group.latest_created_at)}
                      </div>
                    </div>
                    <AlertTriangle className="h-6 w-6 text-orange-500" />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">
                Como funciona a limpeza automática:
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Mantém sempre a proposta mais recente de cada grupo</li>
                <li>• Exclui automaticamente as versões mais antigas</li>
                <li>• Previne futuras duplicatas através de trigger automático</li>
                <li>• Considera duplicatas: mesmo CNPJ + mesmo Valor Consolidado</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
