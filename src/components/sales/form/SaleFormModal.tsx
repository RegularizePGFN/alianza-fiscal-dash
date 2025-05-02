
import { useState, useEffect } from "react";
import { Sale, PaymentMethod } from "@/lib/types";
import { getTodayISO } from "@/lib/utils";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { validateSaleForm } from "./SaleFormUtils";
import { ClientFormFields } from "./ClientFormFields";
import { SaleDetailsFields } from "./SaleDetailsFields";
import { Loader2 } from "lucide-react";

interface SaleFormModalProps {
  initialData: Sale | null;
  onSave: (sale: Omit<Sale, 'id'>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  open: boolean;
}

export function SaleFormModal({ 
  initialData, 
  onSave, 
  onCancel,
  isSubmitting = false,
  open
}: SaleFormModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Initialize form state only when modal is opened
  const [inputValue, setInputValue] = useState<string>('0,00');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CREDIT);
  const [installments, setInstallments] = useState<number>(1);
  const [saleDate, setSaleDate] = useState<string>(getTodayISO());
  const [clientName, setClientName] = useState<string>("");
  const [clientPhone, setClientPhone] = useState<string>("");
  const [clientDocument, setClientDocument] = useState<string>("");
  
  // Reset form data when initialData changes or modal opens
  useEffect(() => {
    if (!open) return;
    
    setInputValue(initialData ? initialData.gross_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00');
    setAmount(initialData ? initialData.gross_amount : 0);
    setPaymentMethod(initialData ? initialData.payment_method : PaymentMethod.CREDIT);
    setInstallments(initialData ? initialData.installments : 1);
    setSaleDate(initialData ? initialData.sale_date : getTodayISO());
    setClientName(initialData?.client_name || "");
    setClientPhone(initialData?.client_phone || "");
    setClientDocument(initialData?.client_document || "");
  }, [initialData, open]);
  
  // Handle dialog close with safety checks
  const handleDialogClose = () => {
    if (isSubmitting) return;
    onCancel();
  };
  
  const handleSave = () => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para registrar uma venda",
        variant: "destructive",
      });
      return;
    }
    
    if (!validateSaleForm(clientName, clientPhone, clientDocument, amount)) {
      return;
    }
    
    try {
      const saleData = {
        salesperson_id: user.id,
        salesperson_name: user.name,
        gross_amount: amount,
        net_amount: amount,
        payment_method: paymentMethod,
        installments,
        sale_date: saleDate,
        client_name: clientName.trim(),
        client_phone: clientPhone.trim(),
        client_document: clientDocument.trim(),
      };
      
      onSave(saleData);
    } catch (error) {
      console.error("Error in handleSave:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar a venda. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };
  
  // Only render the Dialog when open is true
  if (!open) return null;
  
  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Editar Venda' : 'Nova Venda'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Modifique os dados da venda' : 'Preencha os dados para registrar uma nova venda'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
          <ClientFormFields
            clientName={clientName}
            setClientName={setClientName}
            clientPhone={clientPhone}
            setClientPhone={setClientPhone}
            clientDocument={clientDocument}
            setClientDocument={setClientDocument}
            disabled={isSubmitting}
          />
          
          <SaleDetailsFields
            inputValue={inputValue}
            setInputValue={setInputValue}
            setAmount={setAmount}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            installments={installments}
            setInstallments={setInstallments}
            saleDate={saleDate}
            setSaleDate={setSaleDate}
            disabled={isSubmitting}
          />
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleDialogClose} 
            disabled={isSubmitting}
            type="button"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSubmitting}
            type="button"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {initialData ? 'Salvando...' : 'Adicionando...'}
              </>
            ) : (
              initialData ? 'Salvar Alterações' : 'Adicionar Venda'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
