
import React from 'react';
import { Label } from "@/components/ui/label";
import { ImageIcon } from "lucide-react";

interface ImagePreviewProps {
  imagePreview: string | null;
  processing: boolean;
}

const ImagePreview = ({ imagePreview, processing }: ImagePreviewProps) => {
  if (processing) return null;
  
  if (imagePreview) {
    return (
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
    );
  }
  
  return (
    <div className="flex items-center justify-center h-40 bg-muted/40 border border-dashed rounded-lg">
      <div className="text-center p-4">
        <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          Faça upload de uma imagem para análise OCR
        </p>
      </div>
    </div>
  );
};

export default ImagePreview;
