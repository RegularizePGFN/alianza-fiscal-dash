
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaymentMethod } from "@/lib/types";
import { PAYMENT_METHODS, INSTALLMENT_OPTIONS } from "@/lib/constants";
import { formatCurrencyInput } from "./SaleFormUtils";

interface SaleDetailsFieldsProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  setAmount: (value: number) => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (value: PaymentMethod) => void;
  installments: number;
  setInstallments: (value: number) => void;
  saleDate: string;
  setSaleDate: (value: string) => void;
}

export function SaleDetailsFields({
  inputValue,
  setInputValue,
  setAmount,
  paymentMethod,
  setPaymentMethod,
  installments,
  setInstallments,
  saleDate,
  setSaleDate,
}: SaleDetailsFieldsProps) {

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
    const formattedValue = formatCurrencyInput(inputValue);
    setInputValue(formattedValue);
    
    const numericValue = parseFloat(
      formattedValue
        .replace(/\./g, '')
        .replace(/,/g, '.')
        .replace(/[^\d.]/g, '')
    );
    
    setAmount(isNaN(numericValue) ? 0 : numericValue);
  };

  return (
    <>
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
    </>
  );
}
