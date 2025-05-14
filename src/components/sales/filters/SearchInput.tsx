
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchInputProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function SearchInput({ searchTerm, onSearchChange }: SearchInputProps) {
  return (
    <div className="relative w-full">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="search"
        placeholder="Buscar por cliente, documento ou vendedor..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-9 bg-white dark:bg-gray-800 focus-visible:ring-1"
      />
    </div>
  );
}
