
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

  // Calcular totais por método de pagamento
  const paymentTotals = salesData.reduce((acc, sale) => {
    const amount = sale.gross_amount || 0;
    
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
    }
    
    return acc;
  }, { pix: 0, cartao: 0, boleto: 0 });

  const totalGeral = paymentTotals.pix + paymentTotals.cartao + paymentTotals.boleto;

  const paymentMethods = [
    {
      name: "PIX",
      value: paymentTotals.pix,
      icon: Smartphone,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30"
    },
    {
      name: "Cartão",
      value: paymentTotals.cartao,
      icon: CreditCard,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30"
    },
    {
      name: "Boleto",
      value: paymentTotals.boleto,
      icon: FileText,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/30"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {paymentMethods.map((method) => (
        <Card key={method.name} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {method.name}
            </CardTitle>
            <div className={`p-2 rounded-lg ${method.bgColor}`}>
              <method.icon className={`h-4 w-4 ${method.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
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
            <DollarSign className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            {formatCurrency(totalGeral)}
          </div>
          <p className="text-xs text-muted-foreground">
            Soma de todos os métodos
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
