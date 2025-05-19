
import React, { useRef, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, Image, Clipboard } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}

const FileUpload = ({ onImageChange, disabled }: FileUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLLabelElement>(null);

  // Handle clipboard paste events
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (disabled) return;
      
      const items = e.clipboardData?.items;
      if (!items) return;
      
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file && inputRef.current) {
            // Create a DataTransfer object to create a valid file input event
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            inputRef.current.files = dataTransfer.files;
            
            // Trigger the onChange event manually
            const event = new Event('change', { bubbles: true });
            inputRef.current.dispatchEvent(event);
            break;
          }
        }
      }
    };
    
    // Add event listener to the document for detecting paste events
    document.addEventListener('paste', handlePaste);
    
    // Cleanup
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [disabled, onImageChange]);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Image className="h-5 w-5 text-purple-500 dark:text-purple-400" />
        <Label htmlFor="image" className="text-lg font-medium dark:text-gray-100">Upload de Simulação PGFN</Label>
      </div>
      
      <div 
        className={cn(
          "border-2 border-dashed rounded-xl p-8 transition-colors text-center",
          disabled 
            ? "bg-muted/20 border-muted cursor-not-allowed dark:bg-gray-800/50 dark:border-gray-700" 
            : "border-purple-300 hover:border-purple-500 hover:bg-purple-50 cursor-pointer dark:border-purple-500/50 dark:hover:border-purple-400 dark:hover:bg-purple-900/20"
        )}
      >
        <label 
          ref={dropzoneRef}
          htmlFor="image" 
          className="flex flex-col items-center justify-center cursor-pointer"
        >
          <Upload className={cn(
            "h-10 w-10 mb-4", 
            disabled ? "text-muted-foreground" : "text-purple-500 dark:text-purple-400"
          )} />
          <span className={cn(
            "text-lg font-medium",
            disabled ? "text-muted-foreground" : "text-purple-700 dark:text-purple-300"
          )}>
            Clique, arraste ou cole sua imagem
          </span>
          <div className="flex items-center gap-2 mt-2">
            <p className={cn(
              "text-sm",
              "text-muted-foreground dark:text-gray-400"
            )}>
              Suporta PNG, JPG ou JPEG (máx. 10MB)
            </p>
            <Clipboard className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input 
            id="image" 
            ref={inputRef}
            type="file" 
            accept="image/*"
            onChange={onImageChange}
            disabled={disabled}
            className="hidden"
          />
        </label>
      </div>
      
      <p className="text-sm text-muted-foreground dark:text-gray-400 italic">
        As imagens são processadas com tecnologia de visão computacional IA avançada.
      </p>
    </div>
  );
};

export default FileUpload;
