
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
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
    <DialogFooter className="gap-2 sm:gap-0 mt-5">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Cancelar
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : initialData ? (
          'Atualizar'
        ) : (
          'Salvar'
        )}
      </Button>
    </DialogFooter>
  );
}
