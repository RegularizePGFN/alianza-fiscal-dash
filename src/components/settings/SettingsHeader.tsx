
import { BellRing, Settings } from "lucide-react";

export function SettingsHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações do sistema
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5 text-muted-foreground" />
      </div>
    </div>
  );
}
