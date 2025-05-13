
import { AppLayout } from "@/components/layout/AppLayout";
import { CommissionCalculator } from "@/components/sales/CommissionCalculator";

export default function CalculatorPage() {
  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Calculadora</h2>
          <p className="text-sm text-muted-foreground">
            Calcule valores líquidos e comissões com base nas taxas de processamento.
          </p>
        </div>
        
        <CommissionCalculator />
      </div>
    </AppLayout>
  );
}
