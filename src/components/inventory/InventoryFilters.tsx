import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { EQUIPMENT_TYPES, EQUIPMENT_STATUSES } from "@/hooks/useInventory";

interface Props {
  search: string;
  onSearch: (s: string) => void;
  type: string;
  onType: (s: string) => void;
  status: string;
  onStatus: (s: string) => void;
  onNew: () => void;
}

export function InventoryFilters({ search, onSearch, type, onType, status, onStatus, onNew }: Props) {
  return (
    <div className="flex flex-col md:flex-row gap-2 items-stretch md:items-center">
      <div className="relative flex-1">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por tag, nome, série, colaborador..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={type} onValueChange={onType}>
        <SelectTrigger className="w-full md:w-[160px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os tipos</SelectItem>
          {EQUIPMENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={status} onValueChange={onStatus}>
        <SelectTrigger className="w-full md:w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          {EQUIPMENT_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
        </SelectContent>
      </Select>
      <Button onClick={onNew} className="md:w-auto">
        <Plus className="w-4 h-4 mr-1" /> Novo item
      </Button>
    </div>
  );
}
