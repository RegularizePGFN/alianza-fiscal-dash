
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { WeeklyDataResult } from "./types";

interface TotalsRowProps {
  availableWeeks: number[];
  weeklyTotals: WeeklyDataResult["weeklyTotals"];
}

export const TotalsRow: React.FC<TotalsRowProps> = ({ 
  availableWeeks,
  weeklyTotals
}) => {
  const grandTotalCount = Object.values(weeklyTotals).reduce((sum, week) => sum + week.count, 0);
  const grandTotalAmount = Object.values(weeklyTotals).reduce((sum, week) => sum + week.amount, 0);

  return (
    <TableRow className="border-t-2 border-t-gray-300 dark:border-t-gray-600">
      <TableCell colSpan={2} className="font-bold">
        Total por Semana
      </TableCell>
      
      {availableWeeks.map((week) => {
        const weekTotal = weeklyTotals[week] || { count: 0, amount: 0 };
        return (
          <React.Fragment key={`total-week-${week}`}>
            <TableCell className="text-center border-l font-bold">
              {weekTotal.count}
            </TableCell>
            <TableCell className="text-right font-bold">
              {formatCurrency(weekTotal.amount)}
            </TableCell>
          </React.Fragment>
        );
      })}
      
      {/* Grand Totals */}
      <TableCell className="text-center border-l font-bold bg-muted/30">
        {grandTotalCount}
      </TableCell>
      <TableCell className="text-right font-bold bg-muted/30">
        {formatCurrency(grandTotalAmount)}
      </TableCell>
    </TableRow>
  );
};
