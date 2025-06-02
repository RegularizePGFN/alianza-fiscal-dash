
import { AppLayout } from "@/components/layout/AppLayout";
import { FinanceiroContainer } from "@/components/financeiro/FinanceiroContainer";
import { useAuth } from "@/contexts/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function FinanceiroPage() {
  const { user } = useAuth();
  
  // Verificar se o usuário tem acesso
  const hasAccess = user?.email === 'felipe.souza@socialcriativo.com';

  if (!hasAccess) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <CardTitle>Acesso Negado</CardTitle>
              <CardDescription>
                Você não tem permissão para acessar esta área.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <FinanceiroContainer />
    </AppLayout>
  );
}
