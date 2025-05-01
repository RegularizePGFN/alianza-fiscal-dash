
import { useState, useEffect } from "react";
import { calculateNetAmount } from "@/lib/utils";
import { PaymentMethod } from "@/lib/types";
import { PAYMENT_METHODS, INSTALLMENT_OPTIONS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function CommissionCalculator() {
  const [grossAmount, setGrossAmount] = useState<number>(1000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CREDIT);
  const [installments, setInstallments] = useState<number>(1);
  const [netAmount, setNetAmount] = useState<number>(0);
  const [commissionBelow, setCommissionBelow] = useState<number>(0);
  const [commissionAbove, setCommissionAbove] = useState<number>(0);
  
  useEffect(() => {
    const calculatedNetAmount = calculateNetAmount(grossAmount, paymentMethod, installments);
    setNetAmount(calculatedNetAmount);
    
    // Calculate commission at different rates
    setCommissionBelow(calculatedNetAmount * 0.2);
    setCommissionAbove(calculatedNetAmount * 0.25);
  }, [grossAmount, paymentMethod, installments]);
  
  const handleGrossAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value.replace(/[^\d]/g, ''));
    setGrossAmount(isNaN(value) ? 0 : value);
  };
  
  const formatInputValue = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };
  
  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value as PaymentMethod);
    
    // Reset installments for non-credit payment methods
    if (value !== PaymentMethod.CREDIT) {
      setInstallments(1);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Calculadora de Comissão</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="grossAmount">Valor Bruto da Venda</Label>
            <Input
              id="grossAmount"
              type="text"
              value={formatInputValue(grossAmount)}
              onChange={handleGrossAmountChange}
              className="text-right"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
            <Select
              value={paymentMethod}
              onValueChange={handlePaymentMethodChange}
            >
              <SelectTrigger id="paymentMethod">
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
            <div className="space-y-2">
              <Label htmlFor="installments">Parcelas</Label>
              <Select
                value={installments.toString()}
                onValueChange={(value) => setInstallments(parseInt(value))}
                disabled={paymentMethod !== PaymentMethod.CREDIT}
              >
                <SelectTrigger id="installments">
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
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/2">Item</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Valor Bruto</TableCell>
                <TableCell className="text-right">{formatCurrency(grossAmount)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Valor Líquido (após taxas)</TableCell>
                <TableCell className="text-right">{formatCurrency(netAmount)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Comissão (abaixo da meta - 20%)</TableCell>
                <TableCell className="text-right">{formatCurrency(commissionBelow)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Comissão (meta atingida - 25%)</TableCell>
                <TableCell className="text-right">{formatCurrency(commissionAbove)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
