
import { User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface SalespersonRowProps {
  name: string;
  proposalsSent: number;
  fees: string;
  salesCount: number;
  salesAmount: string;
}

export const SalespersonRow = ({
  name,
  proposalsSent,
  fees,
  salesCount,
  salesAmount,
}: SalespersonRowProps) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  return (
    <tr className="border-t dark:border-gray-700 hover:bg-muted/50 dark:hover:bg-gray-800/50">
      <td className="pl-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary">
              {initials || <User size={14} />}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{name}</span>
        </div>
      </td>
      <td className="text-center py-3">{proposalsSent}</td>
      <td className="text-center py-3">R$ {fees}</td>
      <td className="text-center py-3">{salesCount}</td>
      <td className="text-right pr-4 py-3">R$ {salesAmount}</td>
    </tr>
  );
};
