
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Wand2, RefreshCw } from "lucide-react";
import { ExtractedData, CompanyData } from "@/lib/types/proposals";
import { useToast } from "@/hooks/use-toast";

interface AIProposalGeneratorProps {
  proposalData: Partial<ExtractedData>;
  companyData?: CompanyData | null;
  className?: string;
}

export const AIProposalGenerator = ({ proposalData, companyData, className }: AIProposalGeneratorProps) => {
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerateProposal = async () => {
    if (generating) return;

    setGenerating(true);
    setGeneratedImage(null);
    
    toast({
      title: "Gerando proposta",
      description: "Aguarde enquanto a IA cria sua proposta visualmente...",
    });

    try {
      // Prepare template style from proposal data if available
      let templateStyle = {
        primaryColor: '#3B82F6',
        secondaryColor: '#1E40AF',
        accentColor: '#10B981',
        backgroundColor: '#F8FAFC'
      };
      
      try {
        if (proposalData.templateColors) {
          const parsedColors = JSON.parse(proposalData.templateColors);
          templateStyle = {
            ...templateStyle,
            ...parsedColors
          };
        }
      } catch (e) {
        console.error("Error parsing template colors:", e);
      }

      // Get the edge function URL
      const functionUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:54321/functions/v1/render-proposal'
        : 'https://sbxltdbnqixucjoognfj.functions.supabase.co/render-proposal';

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposalData,
          companyData,
          templateStyle
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate proposal');
      }

      setGeneratedImage(data.imageBase64);
      
      // Download the generated image
      if (data.imageBase64) {
        const link = document.createElement('a');
        link.href = data.imageBase64;
        link.download = `proposta-ai-${proposalData.cnpj || 'cliente'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Proposta gerada com sucesso!",
          description: "A imagem da proposta foi salva em seus downloads.",
        });
      }
    } catch (error) {
      console.error("Error generating AI proposal:", error);
      toast({
        title: "Erro ao gerar proposta",
        description: error.message || "Ocorreu um erro ao gerar a proposta com IA.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={handleGenerateProposal}
        disabled={generating}
        className={`relative ${className || ''}`}
      >
        {generating ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            <span>Gerando proposta com IA...</span>
          </>
        ) : (
          <>
            <Wand2 className="mr-2 h-4 w-4" />
            <span>Gerar Proposta com IA</span>
          </>
        )}
      </Button>
      
      {generatedImage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setGeneratedImage(null)}>
          <div className="bg-white p-4 rounded-lg max-w-3xl max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-semibold">Proposta Gerada com IA</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setGeneratedImage(null)}>×</button>
            </div>
            <img src={generatedImage} alt="Proposta gerada com IA" className="w-full h-auto" />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setGeneratedImage(null)}>
                Fechar
              </Button>
              <Button onClick={() => {
                const link = document.createElement('a');
                link.href = generatedImage;
                link.download = `proposta-ai-${proposalData.cnpj || 'cliente'}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}>
                Baixar Novamente
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
