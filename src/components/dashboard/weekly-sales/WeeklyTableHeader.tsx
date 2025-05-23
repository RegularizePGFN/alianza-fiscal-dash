
import React from "react";
import { TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SortState, WeekRange } from "./types";
import { formatWeekRange } from "./utils";

interface WeeklyTableHeaderProps {
  availableWeeks: number[];
  currentWeek: number;
  sortState: SortState;
  onSort: (week: number, field: "count" | "amount") => void;
  weekRanges: WeekRange[];
}

export const WeeklyTableHeader: React.FC<WeeklyTableHeaderProps> = ({ 
  availableWeeks, 
  currentWeek,
  sortState,
  onSort,
  weekRanges
}) => {
  const renderSortIcon = (week: number, field: "count" | "amount") => {
    if (sortState.week === week && sortState.field === field) {
      return sortState.direction === "asc" ? 
        <ArrowUp className="h-3 w-3" /> : 
        <ArrowDown className="h-3 w-3" />;
    }
    return null;
  };

  // Helper function to find date range for a specific week
  const getWeekDateRange = (weekNumber: number): string => {
    const weekRange = weekRanges.find(range => range.weekNumber === weekNumber);
    if (weekRange) {
      return formatWeekRange(weekRange);
    }
    return '';
  };

  return (
    <TableHeader>
      <TableRow>
        <TableHead rowSpan={2} className="w-12 align-bottom">#</TableHead>
        <TableHead rowSpan={2} className="align-bottom">Vendedor</TableHead>
        
        {availableWeeks.map((week) => (
          <React.Fragment key={`week-${week}`}>
            <TableHead colSpan={2} className="text-center border-l">
              Semana {week} {week === currentWeek ? '(atual)' : ''} 
              <span className="block text-xs text-muted-foreground">
                {getWeekDateRange(week)}
              </span>
            </TableHead>
          </React.Fragment>
        ))}
        
        <TableHead colSpan={2} className="text-center border-l bg-muted/30">
          Total
        </TableHead>
      </TableRow>
      
      <TableRow>
        {availableWeeks.map((week) => (
          <React.Fragment key={`week-headers-${week}`}>
            <TableHead className="text-center border-l p-2">
              <Button 
                variant="ghost" 
                size="sm"
                className={`py-0 px-1 h-auto text-xs ${sortState.week === week && sortState.field === "count" ? "bg-muted" : ""}`}
                onClick={() => onSort(week, "count")}
              >
                Vendas {renderSortIcon(week, "count")}
              </Button>
            </TableHead>
            <TableHead className="text-center p-2">
              <Button 
                variant="ghost" 
                size="sm"
                className={`py-0 px-1 h-auto text-xs ${sortState.week === week && sortState.field === "amount" ? "bg-muted" : ""}`}
                onClick={() => onSort(week, "amount")}
              >
                Valor {renderSortIcon(week, "amount")}
              </Button>
            </TableHead>
          </React.Fragment>
        ))}
        <TableHead className="text-center border-l bg-muted/30">Vendas</TableHead>
        <TableHead className="text-center bg-muted/30">Valor</TableHead>
      </TableRow>
    </TableHeader>
  );
};
