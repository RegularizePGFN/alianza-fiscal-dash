
import { FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

interface ImportButtonProps {
  onImport: (file: File) => void;
}

export function ImportButton({ onImport }: ImportButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      // Reset the input to allow importing the same file again
      if (e.target) e.target.value = '';
    }
  };

  return (
    <>
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept=".xlsx,.xls" 
        onChange={handleFileChange}
      />
      <Button
        onClick={handleButtonClick}
        variant="outline"
        size="sm"
        className="hidden md:flex"
      >
        <FileUp className="mr-2 h-4 w-4" />
        Importar
      </Button>
    </>
  );
}
