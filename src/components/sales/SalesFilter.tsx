
import React, { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search, PlusCircle, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sale } from "@/lib/types";

interface SalesFilterProps {
  sales: Sale[];
  onFilter: (filtered: Sale[]) => void;
  onSearch: (term: string) => void;
  onAddSale: () => void;
  onImport?: (file: File) => void;
  isAdmin?: boolean;
}

export function SalesFilter({ 
  sales, 
  onFilter, 
  onSearch,
  onAddSale,
  onImport,
  isAdmin = false
}: SalesFilterProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    onSearch(term);
    
    // Filter sales based on search term
    if (term.trim() === "") {
      onFilter(sales);
    } else {
      const filtered = sales.filter((sale) => {
        const lowercaseTerm = term.toLowerCase();
        return (
          sale.client_name?.toLowerCase().includes(lowercaseTerm) ||
          sale.salesperson_name?.toLowerCase().includes(lowercaseTerm) ||
          sale.client_document?.toLowerCase().includes(lowercaseTerm)
        );
      });
      onFilter(filtered);
    }
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onImport) {
      onImport(file);
      // Reset the input value to allow selecting the same file again
      if (event.target) {
        event.target.value = '';
      }
    }
  };
  
  return (
    <div className="flex flex-wrap justify-between items-center gap-4 py-2">
      <div className="relative flex-grow max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar vendas..."
          className="pl-8 pr-4"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>
      
      <div className="flex gap-2">
        <Button onClick={onAddSale}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova Venda
        </Button>
        
        {isAdmin && onImport && (
          <Button variant="outline" onClick={handleImportClick}>
            <FileUp className="mr-2 h-4 w-4" />
            Importar
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
            />
          </Button>
        )}
      </div>
    </div>
  );
}
