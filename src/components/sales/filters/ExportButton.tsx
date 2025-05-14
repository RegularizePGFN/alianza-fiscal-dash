
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExportButtonProps {
  onExport: () => void;
}

export function ExportButton({ onExport }: ExportButtonProps) {
  return (
    <Button
      onClick={onExport}
      variant="outline"
      size="icon"
      className="hidden md:flex"
      aria-label="Exportar"
    >
      <FileDown className="h-4 w-4" />
    </Button>
  );
}
