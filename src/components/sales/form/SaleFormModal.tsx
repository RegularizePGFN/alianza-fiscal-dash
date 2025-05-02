
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
}

export function SaleFormModal({ 
  initialData, 
  onSave, 
  onCancel,
  isSubmitting = false
}: SaleFormModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [inputValue, setInputValue] = useState<string>(
    initialData ? initialData.gross_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'
  );
  const [amount, setAmount] = useState<number>(initialData ? initialData.gross_amount : 0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    initialData ? initialData.payment_method : PaymentMethod.CREDIT
  );
  const [installments, setInstallments] = useState<number>(
    initialData ? initialData.installments : 1
  );
  const [saleDate, setSaleDate] = useState<string>(
    initialData ? initialData.sale_date : getTodayISO()
  );
  const [clientName, setClientName] = useState<string>(
    initialData?.client_name || ""
  );
  const [clientPhone, setClientPhone] = useState<string>(
    initialData?.client_phone || ""
  );
  const [clientDocument, setClientDocument] = useState<string>(
    initialData?.client_document || ""
  );
  const [isOpen, setIsOpen] = useState<boolean>(true);
  
  // Clean up when the component unmounts
  useEffect(() => {
    return () => {
      // This ensures any resources are properly released
      console.log("SaleFormModal unmounted");
    };
  }, []);
  
  // Handle dialog close
  const handleDialogClose = () => {
    if (isSubmitting) {
      return;
    }
    setIsOpen(false);
    // Delay the onCancel to ensure the dialog animation completes
    setTimeout(() => {
      onCancel();
    }, 300);
  };
  
  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para registrar uma venda",
        variant: "destructive",
      });
      return;
    }
    
    if (!validateSaleForm(clientName, clientPhone, clientDocument, amount)) {
      toast({
        title: "Formulário inválido",
        description: "Verifique os campos obrigatórios",
        variant: "destructive",
      });
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
  
  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
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
