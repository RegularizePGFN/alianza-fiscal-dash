import { Card, CardContent } from "@/components/ui/card";
import { Package, CheckCircle2, UserCheck, Wrench } from "lucide-react";
import { EquipmentWithAssignment } from "@/hooks/useInventory";

export function InventoryKpiCards({ items }: { items: EquipmentWithAssignment[] }) {
  const total = items.length;
  const inUse = items.filter(i => i.status === "em_uso").length;
  const available = items.filter(i => i.status === "disponivel").length;
  const maintenance = items.filter(i => i.status === "manutencao").length;

  const cards = [
    { label: "Total", value: total, icon: Package, color: "text-foreground" },
    { label: "Em uso", value: inUse, icon: UserCheck, color: "text-primary" },
    { label: "Disponíveis", value: available, icon: CheckCircle2, color: "text-success" },
    { label: "Manutenção", value: maintenance, icon: Wrench, color: "text-warning" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map(c => (
        <Card key={c.label}>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">{c.label}</div>
              <div className="text-2xl font-semibold mt-1">{c.value}</div>
            </div>
            <c.icon className={`w-5 h-5 ${c.color}`} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
