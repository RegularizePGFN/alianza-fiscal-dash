
import React from "react";
import { TableHeader, TableRow, TableHead } from "@/components/ui/table";

interface WeeklyTableHeaderProps {
  availableWeeks: number[];
  currentWeek: number;
}

export const WeeklyTableHeader: React.FC<WeeklyTableHeaderProps> = ({ availableWeeks, currentWeek }) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead rowSpan={2} className="w-12 align-bottom">#</TableHead>
        <TableHead rowSpan={2} className="align-bottom">Vendedor</TableHead>
        
        {availableWeeks.map((week) => (
          <React.Fragment key={`week-${week}`}>
            <TableHead colSpan={2} className="text-center border-l">
              Semana {week} {week === currentWeek ? '(atual)' : ''}
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
            <TableHead className="text-center border-l">Vendas</TableHead>
            <TableHead className="text-center">Valor</TableHead>
          </React.Fragment>
        ))}
        <TableHead className="text-center border-l bg-muted/30">Vendas</TableHead>
        <TableHead className="text-center bg-muted/30">Valor</TableHead>
      </TableRow>
    </TableHeader>
  );
};
