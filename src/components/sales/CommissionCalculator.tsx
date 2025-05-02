import { useState, useEffect } from "react";
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
import { DEFAULT_GOAL_AMOUNT } from "@/lib/constants";

export function CommissionCalculator() {
  const [grossAmount, setGrossAmount] = useState<number>(1000);
  const [inputValue, setInputValue] = useState<string>('1.000,00');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CREDIT);
  const [installments, setInstallments] = useState<number>(1);
  const [netAmount, setNetAmount] = useState<number>(0);
  const [commissionBelow, setCommissionBelow] = useState<number>(0);
  const [commissionAbove, setCommissionAbove] = useState<number>(0);
  const [simulatedTotal, setSimulatedTotal] = useState<number>(0);
  
  useEffect(() => {
    // Calculate net amount based on the correct fee rules
    let calculatedNetAmount = 0;
    
    if (paymentMethod === PaymentMethod.CREDIT) {
      // Credit card: 1.9% for single payment, 2.39% for installments
      const feeRate = installments > 1 ? 0.0239 : 0.019;
      calculatedNetAmount = grossAmount * (1 - feeRate);
    } 
    else if (paymentMethod === PaymentMethod.BOLETO || paymentMethod === PaymentMethod.PIX) {
      // Boleto and PIX: 5.79% fee
      calculatedNetAmount = grossAmount * (1 - 0.0579);
    }
    else if (paymentMethod === PaymentMethod.DEBIT) {
      // Debit card: 1.89% + R$0.35 fixed fee
      calculatedNetAmount = grossAmount * (1 - 0.0189) - 0.35;
      calculatedNetAmount = Math.max(0, calculatedNetAmount); // Prevent negative values
    }
    
    setNetAmount(calculatedNetAmount);
    
    // Simulate monthly sales with this sale added
    const monthlyTotal = simulatedTotal + calculatedNetAmount;
    
    // Calculate commission at different rates based on goal achievement
    // Commission is always calculated on net amount (after fees)
    const belowGoalRate = 0.20;
    const aboveGoalRate = 0.25;
    
    // If simulated total is below goal, apply below goal rate
    setCommissionBelow(calculatedNetAmount * belowGoalRate);
    
    // If simulated total is above goal, apply above goal rate
    setCommissionAbove(calculatedNetAmount * aboveGoalRate);
  }, [grossAmount, paymentMethod, installments, simulatedTotal]);
  
  // Handle simulated total change (monthly sales)
  const handleSimulatedTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    
    // Convert the input value to a number for calculations
    const numericValue = parseFloat(
      rawValue
        .replace(/\./g, '')  // Remove dots (thousands separators)
        .replace(/,/g, '.')  // Replace comma with dot (for decimal)
        .replace(/[^\d.]/g, '') // Remove all non-numeric characters except dot
    );
    
    setSimulatedTotal(isNaN(numericValue) ? 0 : numericValue);
  };
  
  const handleGrossAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setInputValue(rawValue);
    
    // Keep cursor position
    const cursorPos = e.target.selectionStart;
    
    // Convert the input value to a number for calculations
    const cleanedValue = rawValue
      .replace(/\./g, '')  // Remove dots (thousands separators)
      .replace(/,/g, '.')  // Replace comma with dot (for decimal)
      .replace(/[^\d.]/g, ''); // Remove all non-numeric characters except dot
    
    const numericValue = parseFloat(cleanedValue);
    setGrossAmount(isNaN(numericValue) ? 0 : numericValue);
  };
  
  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value as PaymentMethod);
    
    // Reset installments for non-credit payment methods
    if (value !== PaymentMethod.CREDIT) {
      setInstallments(1);
    }
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
        setGrossAmount(numValue);
      } else {
        setInputValue('0,00');
        setGrossAmount(0);
      }
    } catch (e) {
      setInputValue('0,00');
      setGrossAmount(0);
    }
  };
  
  // Check if goal is reached
  const isGoalReached = (simulatedTotal + netAmount) >= DEFAULT_GOAL_AMOUNT;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Calculadora de Comissão</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="grossAmount">Valor Bruto da Venda</Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                R$
              </span>
              <Input
                id="grossAmount"
                type="text"
                value={inputValue}
                onChange={handleGrossAmountChange}
                onBlur={handleBlur}
                className="pl-10 text-right"
              />
            </div>
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
        
        <div className="space-y-2">
          <Label htmlFor="simulatedTotal">Total de Vendas do Mês (líquido)</Label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
              R$
            </span>
            <Input
              id="simulatedTotal"
              type="text"
              value={simulatedTotal.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              onChange={handleSimulatedTotalChange}
              className="pl-10 text-right"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Meta: {formatCurrency(DEFAULT_GOAL_AMOUNT)}
          </div>
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
                <TableCell className="font-medium">Taxa Aplicada</TableCell>
                <TableCell className="text-right">
                  {paymentMethod === PaymentMethod.CREDIT 
                    ? `${installments > 1 ? '2,39%' : '1,90%'}`
                    : paymentMethod === PaymentMethod.DEBIT 
                      ? '1,89% + R$0,35'
                      : '5,79%'
                  }
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Total Mensal (com esta venda)</TableCell>
                <TableCell className="text-right">{formatCurrency(simulatedTotal + netAmount)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium" colSpan={2}>
                  <div className="font-bold mt-2">Comissão (calculada sobre o valor líquido):</div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={`font-medium ${!isGoalReached ? 'font-bold' : ''}`}>
                  Meta não atingida (20%)
                </TableCell>
                <TableCell className={`text-right ${!isGoalReached ? 'font-bold' : ''}`}>
                  {formatCurrency(commissionBelow)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={`font-medium ${isGoalReached ? 'font-bold' : ''}`}>
                  Meta atingida (25%)
                </TableCell>
                <TableCell className={`text-right ${isGoalReached ? 'font-bold' : ''}`}>
                  {formatCurrency(commissionAbove)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
