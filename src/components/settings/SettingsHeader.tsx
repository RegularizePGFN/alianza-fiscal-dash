
import { Settings, Users } from "lucide-react";
import { NotificationsPopover } from "@/components/notifications/NotificationsPopover";

export function SettingsHeader() {
  return (
    <div>
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações do sistema e metas dos vendedores
          </p>
        </div>
      </div>
    </div>
  );
}
