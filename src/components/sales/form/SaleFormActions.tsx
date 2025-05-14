
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2, Save, X } from "lucide-react";
import { Sale } from "@/lib/types";

interface SaleFormActionsProps {
  isSubmitting: boolean;
  initialData?: Sale | null;
  onCancel: () => void;
}

export function SaleFormActions({ 
  isSubmitting, 
  initialData, 
  onCancel 
}: SaleFormActionsProps) {
  return (
    <DialogFooter className="gap-2 sm:gap-0 mt-6 pt-4 border-t">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
        className="gap-2"
      >
        <X className="h-4 w-4" />
        Cancelar
      </Button>
      <Button type="submit" disabled={isSubmitting} className="gap-2">
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            {initialData ? 'Atualizar' : 'Salvar'}
          </>
        )}
      </Button>
    </DialogFooter>
  );
}
