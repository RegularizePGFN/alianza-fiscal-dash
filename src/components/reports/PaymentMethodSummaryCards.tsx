
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Smartphone, FileText, DollarSign } from "lucide-react";
import { Sale, PaymentMethod } from "@/lib/types";

interface PaymentMethodSummaryCardsProps {
  salesData: Sale[];
}

export function PaymentMethodSummaryCards({ salesData }: PaymentMethodSummaryCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Debug: Log dos dados recebidos
  console.log("PaymentMethodSummaryCards - Total sales received:", salesData.length);
  console.log("PaymentMethodSummaryCards - Sales data sample:", salesData.slice(0, 3));

  // Calcular totais por método de pagamento
  const paymentTotals = salesData.reduce((acc, sale) => {
    const amount = sale.gross_amount || 0;
    
    console.log(`Processing sale: ${sale.id}, amount: ${amount}, method: ${sale.payment_method}, date: ${sale.sale_date}`);
    
    switch (sale.payment_method) {
      case PaymentMethod.PIX:
        acc.pix += amount;
        break;
      case PaymentMethod.CREDIT:
      case PaymentMethod.DEBIT:
        acc.cartao += amount;
        break;
      case PaymentMethod.BOLETO:
        acc.boleto += amount;
        break;
      default:
        console.warn(`Unknown payment method: ${sale.payment_method} for sale ${sale.id}`);
    }
    
    return acc;
  }, { pix: 0, cartao: 0, boleto: 0 });

  const totalGeral = paymentTotals.pix + paymentTotals.cartao + paymentTotals.boleto;

  console.log("PaymentMethodSummaryCards - Calculated totals:", {
    pix: paymentTotals.pix,
    cartao: paymentTotals.cartao,
    boleto: paymentTotals.boleto,
    total: totalGeral
  });

  const paymentMethods = [
    {
      name: "PIX",
      value: paymentTotals.pix,
      icon: Smartphone,
      color: "text-green-700 dark:text-green-300",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      cardBg: "border-2 border-green-200/50 bg-green-50/30 dark:border-green-800/50 dark:bg-green-900/10"
    },
    {
      name: "Cartão",
      value: paymentTotals.cartao,
      icon: CreditCard,
      color: "text-blue-700 dark:text-blue-300",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      cardBg: "border-2 border-blue-200/50 bg-blue-50/30 dark:border-blue-800/50 dark:bg-blue-900/10"
    },
    {
      name: "Boleto",
      value: paymentTotals.boleto,
      icon: FileText,
      color: "text-orange-700 dark:text-orange-300",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      cardBg: "border-2 border-orange-200/50 bg-orange-50/30 dark:border-orange-800/50 dark:bg-orange-900/10"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {paymentMethods.map((method) => (
        <Card key={method.name} className={`hover:shadow-lg transition-all ${method.cardBg}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {method.name}
            </CardTitle>
            <div className={`p-2 rounded-lg ${method.bgColor}`}>
              <method.icon className={`h-6 w-6 ${method.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${method.color}`}>
              {formatCurrency(method.value)}
            </div>
            <p className="text-xs text-muted-foreground">
              Recebido por {method.name.toLowerCase()}
            </p>
          </CardContent>
        </Card>
      ))}
      
      {/* Card do Total Geral */}
      <Card className="border-2 border-primary/20 bg-primary/5 hover:shadow-lg transition-all">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Geral
          </CardTitle>
          <div className="p-2 bg-primary/20 rounded-lg">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            {formatCurrency(totalGeral)}
          </div>
          <p className="text-xs text-muted-foreground">
            Soma de todos os métodos ({salesData.length} vendas)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
