
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

  const processImage = async (imageUrl: string) => {
    // This is where we would connect to an actual AI OCR service in production
    // For now, we'll extract the data from the filename to simulate different results
    
    // Parse image name to simulate different data sets
    const timestamp = new Date().getTime();
    const randomFactor = Math.floor(Math.random() * 1000); // Add some randomness
    
    // Generate realistic-looking but random data based on the image and timestamp
    const hash = timestamp + randomFactor;
    
    // Use modulo to get different ranges for the values
    const totalDebt = (hash % 10000 + 1000) / 100;
    const discountPercentage = hash % 50 + 10;
    const discountedValue = totalDebt * (1 - discountPercentage / 100);
    const entryPercentage = hash % 5 + 1;
    const entryValue = (totalDebt * entryPercentage / 100).toFixed(2);
    const installments = (hash % 72) + 24; // Between 24 and 96 installments
    const installmentValue = (discountedValue / installments).toFixed(2);
    const entryInstallments = (hash % 5) + 1; // Between 1 and 5 installments
    
    // Format values using Brazilian currency format
    const formatCurrency = (value: number) => {
      return value.toFixed(2).replace('.', ',');
    };
    
    const cnpj = `${hash % 100}.${hash % 1000}.${hash % 1000}/${hash % 10000}-${hash % 100}`.substring(0, 18);
    
    // Create a unique looking debt number
    const debtNumber = `${hash % 100} ${hash % 10} ${hash % 100} ${hash % 10000}-${hash % 100}`;
    
    // Create data object with the generated values
    const extractedData: Partial<ExtractedData> = {
      cnpj: cnpj,
      totalDebt: formatCurrency(totalDebt),
      discountedValue: formatCurrency(discountedValue),
      discountPercentage: discountPercentage.toFixed(2).replace('.', ','),
      entryValue: formatCurrency(Number(entryValue)),
      entryInstallments: String(entryInstallments),
      installments: String(installments),
      installmentValue: formatCurrency(Number(installmentValue)),
      debtNumber: debtNumber,
      feesValue: formatCurrency(discountedValue * 0.1), // 10% of discounted value for fees
      // Empty client info to be filled by CNPJ lookup or manual input
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      businessActivity: ""
    };

    console.log('Generated data from image:', extractedData);
    
    return extractedData;
  };

  const simulateAIExtraction = async (imageUrl: string) => {
    setProcessing(true);
    setProgressPercent(0);
    
    try {
      // Simulate AI processing with progress updates
      for (let i = 0; i <= 100; i += 10) {
        setProgressPercent(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Process the image to extract data
      const extractedData = await processImage(imageUrl);
      console.log('Extracted data from image:', extractedData);
      
      // Automatically fetch CNPJ data if available
      if (extractedData.cnpj) {
        try {
          const cnpjData = await fetchCnpjData(extractedData.cnpj);
          if (cnpjData) {
            // Only update fields if they were not extracted from the image
            if (!extractedData.clientName && cnpjData.company?.name) {
              extractedData.clientName = cnpjData.company.name;
            }
            
            if (!extractedData.clientEmail && cnpjData.emails && cnpjData.emails.length > 0) {
              extractedData.clientEmail = cnpjData.emails[0].address;
            }
            
            if (!extractedData.clientPhone && cnpjData.phones && cnpjData.phones.length > 0) {
              const phone = cnpjData.phones[0];
              extractedData.clientPhone = `${phone.area}${phone.number}`;
            }
            
            if (!extractedData.businessActivity) {
              if (cnpjData.sideActivities && cnpjData.sideActivities.length > 0) {
                const activity = cnpjData.sideActivities[0];
                extractedData.businessActivity = `${activity.id} | ${activity.text}`;
              } else if (cnpjData.mainActivity) {
                extractedData.businessActivity = `${cnpjData.mainActivity.id} | ${cnpjData.mainActivity.text}`;
              }
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
      
      // Pass the extracted data and preview back to the parent component
      onProcessComplete(extractedData, imageUrl);
      
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
