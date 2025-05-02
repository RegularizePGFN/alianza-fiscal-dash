import { useState } from "react";
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
  
  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Authentication error",
        description: "You need to be logged in to record a sale",
        variant: "destructive",
      });
      return;
    }
    
    if (!validateSaleForm(clientName, clientPhone, clientDocument, amount)) return;
    
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
        title: "Error saving",
        description: "An error occurred while saving the sale. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Dialog open={true} onOpenChange={() => !isSubmitting && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Sale' : 'New Sale'}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
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
            onClick={onCancel} 
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleSave} 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {initialData ? 'Saving...' : 'Adding...'}
              </>
            ) : (
              initialData ? 'Save Changes' : 'Add Sale'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
