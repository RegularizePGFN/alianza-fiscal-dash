import React from 'react';
import { Label } from "@/components/ui/label";
import { Image } from "lucide-react";
import { cn } from "@/lib/utils";
interface ImagePreviewProps {
  imagePreview: string | null;
  processing: boolean;
}
const ImagePreview = ({
  imagePreview,
  processing
}: ImagePreviewProps) => {
  if (processing) return null;
  if (imagePreview) {
    return <div className="space-y-3 mt-6">
        <div className="flex items-center space-x-2">
          <Image className="h-5 w-5 text-purple-500" />
          <Label className="text-lg font-medium">Imagem Enviada</Label>
        </div>
        <div className="overflow-hidden rounded-lg border border-purple-200 bg-white shadow-sm">
          <div className="relative aspect-video w-full overflow-hidden">
            <img src={imagePreview} alt="Preview da simulação PGFN" className="h-full w-full object-contain" />
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 text-xs text-center text-muted-foreground border-t border-purple-100">
            Esta imagem está sendo processada pela nossa Inteligência Artificial avançada
          </div>
        </div>
      </div>;
  }
  return;
};
export default ImagePreview;