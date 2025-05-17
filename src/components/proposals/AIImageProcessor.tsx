
import { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExtractedData } from '@/lib/types/proposals';
import { fetchCnpjData } from '@/lib/api';

interface AIImageProcessorProps {
  onProcessComplete: (data: Partial<ExtractedData>, preview: string) => void;
  processing: boolean;
  setProcessing: (isProcessing: boolean) => void;
  progressPercent: number;
  setProgressPercent: (percent: number) => void;
}

const AIImageProcessor = ({
  onProcessComplete,
  processing,
  setProcessing,
  progressPercent,
  setProgressPercent
}: AIImageProcessorProps) => {
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const simulateAIExtraction = async (imageUrl: string) => {
    setProcessing(true);
    setProgressPercent(0);
    
    try {
      // Simulate AI processing with progress updates
      for (let i = 0; i <= 100; i += 10) {
        setProgressPercent(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Generate sample data (in a real app, this would be AI-processed)
      const sampleData = generateSampleData();
      
      // Automatically fetch CNPJ data if available
      if (sampleData.cnpj) {
        try {
          const cnpjData = await fetchCnpjData(sampleData.cnpj);
          if (cnpjData) {
            // Update client information with CNPJ data
            if (cnpjData.company && cnpjData.company.name) {
              sampleData.clientName = cnpjData.company.name;
            }
            
            if (cnpjData.emails && cnpjData.emails.length > 0) {
              sampleData.clientEmail = cnpjData.emails[0].address;
            }
            
            if (cnpjData.phones && cnpjData.phones.length > 0) {
              const phone = cnpjData.phones[0];
              sampleData.clientPhone = `${phone.area}${phone.number}`;
            }
            
            // Add business activity information
            if (cnpjData.sideActivities && cnpjData.sideActivities.length > 0) {
              const activity = cnpjData.sideActivities[0];
              sampleData.businessActivity = `${activity.id} | ${activity.text}`;
            } else if (cnpjData.mainActivity) {
              sampleData.businessActivity = `${cnpjData.mainActivity.id} | ${cnpjData.mainActivity.text}`;
            }

            toast({
              title: "Dados da Empresa",
              description: "Informações do CNPJ foram adicionadas automaticamente!",
            });
          }
        } catch (error) {
          console.error('Erro ao buscar dados do CNPJ:', error);
          // Continue without CNPJ data if there's an error
        }
      }
      
      console.log('AI-generated data:', sampleData);
      
      // Pass the extracted data and preview back to the parent component
      onProcessComplete(sampleData, imageUrl);
      
      toast({
        title: "Processamento concluído",
        description: "Dados extraídos com sucesso! Verifique e ajuste conforme necessário.",
      });
    } catch (error) {
      console.error('Erro na extração por IA:', error);
      toast({
        title: "Erro no processamento",
        description: "Não foi possível processar a imagem. Por favor, insira os dados manualmente.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
      setProgressPercent(100);
    }
  };

  // Function to generate sample data for demonstration
  const generateSampleData = (): Partial<ExtractedData> => {
    return {
      cnpj: '23.561.149/0001-45',
      totalDebt: '3.154,60',
      discountedValue: '1.656,16',
      discountPercentage: '47,50',
      entryValue: '31,54',
      installments: '55',
      installmentValue: '27,24',
      debtNumber: '41 4 22 017179-92',
      feesValue: '165,61',
    };
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setImagePreview(imageUrl);
        
        // Process with AI simulation
        simulateAIExtraction(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Upload de Imagem PGFN</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="image">Imagem da Simulação</Label>
            <Input 
              id="image" 
              type="file" 
              accept="image/*"
              onChange={handleImageChange}
              disabled={processing}
            />
            <p className="text-sm text-muted-foreground">
              Faça upload de uma imagem da simulação do parcelamento PGFN (PNG ou JPG).
            </p>
          </div>
          
          {processing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Analisando imagem com IA... Aguarde alguns segundos.</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
              <p className="text-xs text-gray-500 text-right">{Math.round(progressPercent)}%</p>
            </div>
          )}
          
          {imagePreview && !processing && (
            <div className="mt-4">
              <Label>Prévia da Imagem</Label>
              <div className="mt-2 border rounded-md overflow-hidden max-h-96">
                <img 
                  src={imagePreview} 
                  alt="Preview da simulação PGFN" 
                  className="w-full object-contain"
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIImageProcessor;
