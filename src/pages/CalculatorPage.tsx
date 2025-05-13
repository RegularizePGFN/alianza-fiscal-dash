
import { AppLayout } from "@/components/layout/AppLayout";
import { CommissionCalculator } from "@/components/sales/CommissionCalculator";

export default function CalculatorPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Calculadora</h2>
          <p className="text-muted-foreground">
            Calcule valores líquidos e comissões com base nas taxas de processamento.
          </p>
        </div>
        
        <CommissionCalculator />
      </div>
    </AppLayout>
  );
}
