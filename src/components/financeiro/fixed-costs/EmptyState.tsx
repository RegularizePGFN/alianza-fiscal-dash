
import { Building } from "lucide-react";

export function EmptyState() {
  return (
    <div className="text-center py-12 text-gray-500">
      <Building className="h-16 w-16 mx-auto mb-4 text-gray-300" />
      <h3 className="text-lg font-medium mb-2">Nenhum custo fixo cadastrado</h3>
      <p className="text-sm text-muted-foreground">
        Adicione custos fixos recorrentes como aluguel, salários, etc.
      </p>
    </div>
  );
}
