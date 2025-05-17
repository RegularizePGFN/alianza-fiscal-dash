
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, Image } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}

const FileUpload = ({ onImageChange, disabled }: FileUploadProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Image className="h-5 w-5 text-purple-500" />
        <Label htmlFor="image" className="text-lg font-medium">Upload de Simulação PGFN</Label>
      </div>
      
      <div 
        className={cn(
          "border-2 border-dashed rounded-xl p-8 transition-colors text-center",
          disabled 
            ? "bg-muted/20 border-muted cursor-not-allowed" 
            : "border-purple-300 hover:border-purple-500 hover:bg-purple-50 cursor-pointer"
        )}
      >
        <label 
          htmlFor="image" 
          className="flex flex-col items-center justify-center cursor-pointer"
        >
          <Upload className={cn(
            "h-10 w-10 mb-4", 
            disabled ? "text-muted-foreground" : "text-purple-500"
          )} />
          <span className={cn(
            "text-lg font-medium",
            disabled ? "text-muted-foreground" : "text-purple-700"
          )}>
            Clique ou arraste sua imagem
          </span>
          <p className={cn(
            "text-sm mt-2",
            disabled ? "text-muted-foreground" : "text-muted-foreground"
          )}>
            Suporta PNG, JPG ou JPEG (máx. 10MB)
          </p>
          <Input 
            id="image" 
            type="file" 
            accept="image/*"
            onChange={onImageChange}
            disabled={disabled}
            className="hidden"
          />
        </label>
      </div>
      
      <p className="text-sm text-muted-foreground italic">
        As imagens são processadas com tecnologia de visão computacional IA avançada.
      </p>
    </div>
  );
};

export default FileUpload;
