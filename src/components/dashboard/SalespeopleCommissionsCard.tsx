
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth";
import { UserRole } from "@/lib/types";
import { SalespeopleCommissionsHeader } from "./salespeople/SalespeopleCommissionsHeader";
import { SalespeopleCommissionsTable } from "./salespeople/SalespeopleCommissionsTable";
import { SalespeopleCommissionsLoading } from "./salespeople/SalespeopleCommissionsLoading";
import { useSalespeopleCommissions } from "./salespeople/useSalespeopleCommissions";

export function SalespeopleCommissionsCard() {
  const { salespeople, loading } = useSalespeopleCommissions();
  const { user } = useAuth();

  // Only admins should see this component
  if (user?.role !== UserRole.ADMIN) {
    return null;
  }

  if (loading) {
    return (
      <Card className="w-full">
        <SalespeopleCommissionsLoading />
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <SalespeopleCommissionsHeader />
      <CardContent>
        <SalespeopleCommissionsTable salespeople={salespeople} />
      </CardContent>
    </Card>
  );
}
