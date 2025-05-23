
import React from "react";
import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { WeeklyTableProps } from "./types";
import { WeeklyTableHeader } from "./WeeklyTableHeader";
import { SalespersonRow } from "./SalespersonRow";
import { TotalsRow } from "./TotalsRow";

export const WeeklyTable: React.FC<WeeklyTableProps> = ({
  weeklyData,
  availableWeeks,
  currentWeek,
  weeklyTotals,
  weeklyGoals,
  weekRanges,
  sortState,
  onSort
}) => {
  return (
    <Table className="w-full">
      <WeeklyTableHeader 
        availableWeeks={availableWeeks} 
        currentWeek={currentWeek} 
        sortState={sortState}
        onSort={onSort}
        weekRanges={weekRanges}
      />
      
      <TableBody>
        {weeklyData.length > 0 && weeklyData.map((person) => (
          <SalespersonRow
            key={person.id}
            person={person}
            availableWeeks={availableWeeks}
            weeklyGoals={weeklyGoals}
          />
        ))}
        
        {/* Weekly Totals Row */}
        <TotalsRow
          availableWeeks={availableWeeks}
          weeklyTotals={weeklyTotals}
        />
        
        {weeklyData.length === 0 && (
          <TableRow>
            <TableCell colSpan={2 + (availableWeeks.length * 2) + 2} className="text-center py-6">
              Não há dados de vendas para exibir neste mês.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
