
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FileUploadProps {
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}

const FileUpload = ({ onImageChange, disabled }: FileUploadProps) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="image">Imagem da Simulação</Label>
      <Input 
        id="image" 
        type="file" 
        accept="image/*"
        onChange={onImageChange}
        disabled={disabled}
      />
      <p className="text-sm text-muted-foreground">
        Faça upload de uma imagem da simulação do parcelamento PGFN (PNG ou JPG).
      </p>
    </div>
  );
};

export default FileUpload;
