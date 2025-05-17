
import React from 'react';
import { Label } from "@/components/ui/label";
import { Image } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImagePreviewProps {
  imagePreview: string | null;
  processing: boolean;
}

const ImagePreview = ({ imagePreview, processing }: ImagePreviewProps) => {
  if (processing) return null;
  
  if (imagePreview) {
    return (
      <div className="space-y-3 mt-6">
        <div className="flex items-center space-x-2">
          <Image className="h-5 w-5 text-purple-500" />
          <Label className="text-lg font-medium">Imagem Enviada</Label>
        </div>
        <div className="overflow-hidden rounded-lg border border-purple-200 bg-white shadow-sm">
          <div className="relative aspect-video w-full overflow-hidden">
            <img 
              src={imagePreview} 
              alt="Preview da simulação PGFN" 
              className="h-full w-full object-contain"
            />
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 text-xs text-center text-muted-foreground border-t border-purple-100">
            Esta imagem está sendo processada pela nossa Inteligência Artificial avançada
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center h-60 bg-gradient-to-br from-gray-50 to-purple-50 border border-dashed border-purple-200 rounded-lg mt-6">
      <div className="text-center p-6">
        <div className="bg-purple-100 p-3 rounded-full inline-block mb-3">
          <Image className="h-8 w-8 text-purple-500" />
        </div>
        <p className="text-lg font-medium text-purple-700 mb-1">
          Nenhuma imagem selecionada
        </p>
        <p className="text-sm text-muted-foreground max-w-xs">
          Faça upload de uma imagem para análise com nossa tecnologia de IA avançada
        </p>
      </div>
    </div>
  );
};

export default ImagePreview;
