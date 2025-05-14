
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function SalespeopleCommissionsLoading() {
  return (
    <>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Projeção de Comissões (Vendedores)</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center py-6">
        <LoadingSpinner />
      </CardContent>
    </>
  );
}
