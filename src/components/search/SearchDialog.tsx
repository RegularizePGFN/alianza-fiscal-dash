
import { useState, useEffect } from "react";
import { Command } from "cmdk";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Search, Calendar, Users, ShoppingBag, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Sale, User } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useSales } from "@/hooks/sales";
import { useUsers } from "@/hooks/useUsers";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const navigate = useNavigate();
  const { sales } = useSales();
  const { users } = useUsers();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Reset search query when dialog opens
  useEffect(() => {
    if (open) {
      setSearchQuery("");
    }
  }, [open]);
  
  // Filter sales based on query
  const filteredSales = searchQuery ? sales.filter(sale => {
    const query = searchQuery.toLowerCase();
    return (
      sale.client_name.toLowerCase().includes(query) ||
      sale.client_document.toLowerCase().includes(query) ||
      sale.payment_method.toLowerCase().includes(query) ||
      (sale.salesperson_name && sale.salesperson_name.toLowerCase().includes(query)) ||
      formatCurrency(sale.gross_amount).toLowerCase().includes(query)
    );
  }) : [];
  
  // Filter users based on query
  const filteredUsers = searchQuery ? users.filter(user => {
    const query = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    );
  }) : [];
  
  // Handle navigation
  const handleSelectSale = (sale: Sale) => {
    navigate(`/sales?highlight=${sale.id}`);
    onOpenChange(false);
  };
  
  const handleSelectUser = (user: User) => {
    navigate(`/users?highlight=${user.id}`);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0" onPointerDownOutside={(e) => e.preventDefault()}>
        <Command className="rounded-lg border shadow-md">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              autoFocus
              placeholder="Buscar vendas, clientes, usuários..."
              className="flex h-12 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}>
                <X className="h-4 w-4 shrink-0 opacity-50 hover:opacity-100" />
              </button>
            )}
          </div>
          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            {searchQuery === "" ? (
              <Command.Empty className="py-6 text-center text-sm">
                Digite para buscar vendas, clientes ou usuários...
              </Command.Empty>
            ) : (
              <>
                {filteredSales.length === 0 && filteredUsers.length === 0 ? (
                  <Command.Empty className="py-6 text-center text-sm">
                    Nenhum resultado encontrado.
                  </Command.Empty>
                ) : (
                  <>
                    {filteredSales.length > 0 && (
                      <Command.Group heading="Vendas">
                        {filteredSales.slice(0, 5).map((sale) => (
                          <Command.Item
                            key={sale.id}
                            onSelect={() => handleSelectSale(sale)}
                            className="flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer hover:bg-accent"
                          >
                            <ShoppingBag className="h-4 w-4" />
                            <div className="flex flex-col">
                              <div className="font-medium">{sale.client_name}</div>
                              <div className="text-xs opacity-70 flex gap-2">
                                <span>{formatCurrency(sale.gross_amount)}</span>
                                <span>•</span>
                                <span>{formatDate(sale.sale_date)}</span>
                              </div>
                            </div>
                          </Command.Item>
                        ))}
                        {filteredSales.length > 5 && (
                          <div className="py-1.5 px-2 text-xs text-center opacity-50">
                            + {filteredSales.length - 5} vendas encontradas
                          </div>
                        )}
                      </Command.Group>
                    )}
                    
                    {filteredUsers.length > 0 && (
                      <Command.Group heading="Usuários">
                        {filteredUsers.slice(0, 5).map((user) => (
                          <Command.Item
                            key={user.id}
                            onSelect={() => handleSelectUser(user)}
                            className="flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer hover:bg-accent"
                          >
                            <Users className="h-4 w-4" />
                            <div className="flex flex-col">
                              <div className="font-medium">{user.name}</div>
                              <div className="text-xs opacity-70">
                                {user.email} • {user.role === "admin" ? "Administrador" : "Vendedor"}
                              </div>
                            </div>
                          </Command.Item>
                        ))}
                      </Command.Group>
                    )}
                  </>
                )}
              </>
            )}
          </Command.List>
          
          <div className="border-t p-2">
            <div className="text-xs flex justify-between text-muted-foreground">
              <div className="flex gap-2">
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">↑↓</kbd>
                <span>Navegar</span>
              </div>
              <div className="flex gap-2">
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Enter</kbd>
                <span>Selecionar</span>
              </div>
              <div className="flex gap-2">
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Esc</kbd>
                <span>Fechar</span>
              </div>
            </div>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
