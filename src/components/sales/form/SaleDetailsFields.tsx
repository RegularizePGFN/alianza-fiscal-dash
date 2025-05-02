
import { PaymentMethod } from "@/lib/types";
import { PAYMENT_METHODS, INSTALLMENT_OPTIONS } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  disabled?: boolean;
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
  disabled = false
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
  
  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="amount">Sale Amount</Label>
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
            disabled={disabled}
          />
        </div>
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="payment_method">Payment Method</Label>
        <Select
          value={paymentMethod}
          onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select" />
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
          <Label htmlFor="installments">Installments</Label>
          <Select
            value={installments.toString()}
            onValueChange={(value) => setInstallments(parseInt(value))}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
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
        <Label htmlFor="sale_date">Sale Date</Label>
        <Input
          id="sale_date"
          type="date"
          value={saleDate}
          onChange={(e) => setSaleDate(e.target.value)}
          disabled={disabled}
        />
      </div>
    </>
  );
}
