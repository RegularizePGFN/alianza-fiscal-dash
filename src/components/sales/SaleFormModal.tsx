import { useState, useEffect } from "react";
import { Sale, PaymentMethod } from "@/lib/types";
import { PAYMENT_METHODS, INSTALLMENT_OPTIONS } from "@/lib/constants";
import { getTodayISO } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

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
import { Phone } from "lucide-react";

interface SaleFormModalProps {
  initialData: Sale | null;
  onSave: (sale: Omit<Sale, 'id'>) => void;
  onCancel: () => void;
}

export function SaleFormModal({ initialData, onSave, onCancel }: SaleFormModalProps) {
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
  
  // Format phone number to international format
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^\d+]/g, '');
    
    // Ensure it starts with +
    if (!value.startsWith('+')) {
      value = '+' + value;
    }
    
    // If it's just the + sign, keep it as is
    if (value === '+') {
      setClientPhone(value);
      return;
    }
    
    // Otherwise, format it as needed
    if (value.startsWith('+55')) {
      // Brazilian format
      if (value.length > 13) {
        // +55 21 99999-9999 format (mobile)
        value = value.slice(0, 13);
      }
    } else {
      // Generic international format, limit to reasonable length
      if (value.length > 16) {
        value = value.slice(0, 16);
      }
    }
    
    setClientPhone(value);
  };
  
  // Format CPF/CNPJ
  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^\d]/g, '');
    
    if (value.length <= 11) {
      // Format as CPF: 000.000.000-00
      value = value
        .replace(/(\d{3})(?=\d)/, '$1.')
        .replace(/(\d{3})(?=\d)/, '$1.')
        .replace(/(\d{3})(?=\d)/, '$1-');
    } else {
      // Format as CNPJ: 00.000.000/0000-00
      value = value.slice(0, 14); // Limit to 14 digits
      value = value
        .replace(/(\d{2})(?=\d)/, '$1.')
        .replace(/(\d{3})(?=\d)/, '$1.')
        .replace(/(\d{3})(?=\d)/, '$1/')
        .replace(/(\d{4})(?=\d)/, '$1-');
    }
    
    setClientDocument(value);
  };
  
  const validateForm = (): boolean => {
    if (!clientName.trim()) {
      toast({
        title: "Erro de validação",
        description: "O nome do cliente é obrigatório",
        variant: "destructive",
      });
      return false;
    }
    
    if (!clientPhone.trim() || clientPhone === '+') {
      toast({
        title: "Erro de validação",
        description: "O telefone do cliente é obrigatório",
        variant: "destructive",
      });
      return false;
    }
    
    if (!/^\+[0-9]{10,15}$/.test(clientPhone)) {
      toast({
        title: "Erro de validação",
        description: "Formato de telefone inválido. Use o formato +5521999999999",
        variant: "destructive",
      });
      return false;
    }
    
    if (!clientDocument.trim()) {
      toast({
        title: "Erro de validação",
        description: "O CPF/CNPJ do cliente é obrigatório",
        variant: "destructive",
      });
      return false;
    }
    
    if (amount <= 0) {
      toast({
        title: "Erro de validação",
        description: "O valor da venda deve ser maior que zero",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
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
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
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
          <div className="grid gap-2">
            <Label htmlFor="client_name">Nome do Cliente/Empresa</Label>
            <Input
              id="client_name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Nome completo do cliente ou empresa"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="client_phone">Telefone</Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                <Phone className="h-4 w-4" />
              </span>
              <Input
                id="client_phone"
                value={clientPhone}
                onChange={handlePhoneChange}
                placeholder="+5521999999999"
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Formato internacional: +55 seguido do DDD e número
            </p>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="client_document">CPF/CNPJ</Label>
            <Input
              id="client_document"
              value={clientDocument}
              onChange={handleDocumentChange}
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
            />
          </div>
          
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
