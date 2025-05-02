
import { useState } from "react";
import { Sale, PaymentMethod } from "@/lib/types";
import { getTodayISO } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { validateSaleForm } from "./SaleFormUtils";
import { ClientFormFields } from "./ClientFormFields";
import { SaleDetailsFields } from "./SaleDetailsFields";

interface SaleFormModalProps {
  initialData: Sale | null;
  onSave: (sale: Omit<Sale, 'id'>) => void;
  onCancel: () => void;
}

export function SaleFormModal({ initialData, onSave, onCancel }: SaleFormModalProps) {
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para registrar uma venda",
        variant: "destructive",
      });
      return;
    }
    
    if (!validateSaleForm(clientName, clientPhone, clientDocument, amount)) return;
    
    setIsSubmitting(true);
    
    try {
      console.log("Preparing sale data with user:", user.id, user.name);
      
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
        description: "Ocorreu um erro ao salvar a venda. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Editar Venda' : 'Nova Venda'}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <ClientFormFields
            clientName={clientName}
            setClientName={setClientName}
            clientPhone={clientPhone}
            setClientPhone={setClientPhone}
            clientDocument={clientDocument}
            setClientDocument={setClientDocument}
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
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" onClick={handleSave} disabled={isSubmitting}>
            {initialData ? 'Salvar Alterações' : 'Adicionar Venda'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
