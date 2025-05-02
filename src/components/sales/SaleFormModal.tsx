import { useState, useEffect } from "react";
import { Sale, PaymentMethod } from "@/lib/types";
import { PAYMENT_METHODS, INSTALLMENT_OPTIONS } from "@/lib/constants";
import { getTodayISO } from "@/lib/utils";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { validateSaleForm } from "@/components/sales/form/SaleFormUtils";
import { ClientFormFields } from "@/components/sales/form/ClientFormFields";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

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
  
  const [inputValue, setInputValue] = useState<string>(initialData ? initialData.gross_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00');
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
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setInputValue(rawValue);
    
    // Convert the input value to a number for calculations
    const numericValue = parseFloat(
      rawValue
        .replace(/\./g, '')  // Remove dots (thousands separators)
        .replace(/,/g, '.')  // Replace comma with dot (for decimal)
        .replace(/[^\d.]/g, '') // Remove all non-numeric characters except dot
    );
    
    setAmount(isNaN(numericValue) ? 0 : numericValue);
  };
  
  // Format the input value to currency on blur
  const handleBlur = () => {
    try {
      // Remove currency symbols and non-numeric characters for parsing
      const numValue = parseFloat(
        inputValue
          .replace(/\./g, '')
          .replace(/,/g, '.')
          .replace(/[^\d.]/g, '')
      );
      
      if (!isNaN(numValue)) {
        setInputValue(numValue.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }));
        setAmount(numValue);
      } else {
        setInputValue('0,00');
        setAmount(0);
      }
    } catch (e) {
      setInputValue('0,00');
      setAmount(0);
    }
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
    
    if (!validateSaleForm(clientName, clientPhone, clientDocument, amount)) return;
    
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
      console.error("Error saving sale:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar a venda. Tente novamente.",
        variant: "destructive",
      });
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
          
          <div className="grid gap-2">
            <Label htmlFor="amount">Valor da Venda</Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                R$
              </span>
              <Input
                id="amount"
                type="text"
                value={inputValue}
                onChange={handleAmountChange}
                onBlur={handleBlur}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="payment_method">Forma de Pagamento</Label>
            <Select
              value={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {paymentMethod === PaymentMethod.CREDIT && (
            <div className="grid gap-2">
              <Label htmlFor="installments">Parcelas</Label>
              <Select
                value={installments.toString()}
                onValueChange={(value) => setInstallments(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {INSTALLMENT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="grid gap-2">
            <Label htmlFor="sale_date">Data da Venda</Label>
            <Input
              id="sale_date"
              type="date"
              value={saleDate}
              onChange={(e) => setSaleDate(e.target.value)}
            />
          </div>
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
