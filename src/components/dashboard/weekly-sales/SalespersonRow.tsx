
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/utils";
import { SalespersonData, WeeklyDataResult } from "./types";
import { getColor, getGoalStatusColor } from "./utils";

interface SalespersonRowProps {
  person: SalespersonData & { position: number };
  availableWeeks: number[];
  weeklyGoals: WeeklyDataResult["weeklyGoals"];
}

export const SalespersonRow: React.FC<SalespersonRowProps> = ({ 
  person, 
  availableWeeks,
  weeklyGoals
}) => {
  return (
    <TableRow key={person.id}>
      <TableCell className="font-medium">
        <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-xs text-white ${getColor(person.position)}`}>
          {person.position}
        </span>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center">
          <Avatar className="h-7 w-7 mr-2">
            <AvatarFallback className="text-xs">
              {person.initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{person.name}</span>
        </div>
      </TableCell>
      
      {availableWeeks.map((week) => {
        const weekStats = person.weeklyStats[week] || { count: 0, amount: 0 };
        return (
          <React.Fragment key={`${person.id}-week-${week}`}>
            <TableCell 
              className={`text-center border-l ${getGoalStatusColor(person.id, week, weekStats.amount, weeklyGoals)}`}
            >
              {weekStats.count}
            </TableCell>
            <TableCell 
              className={`text-right ${getGoalStatusColor(person.id, week, weekStats.amount, weeklyGoals)}`}
            >
              {formatCurrency(weekStats.amount)}
            </TableCell>
          </React.Fragment>
        );
      })}
      
      <TableCell className="text-center border-l font-medium bg-muted/30">
        {person.totalCount}
      </TableCell>
      <TableCell className="text-right font-medium bg-muted/30">
        {formatCurrency(person.totalAmount)}
      </TableCell>
    </TableRow>
  );
};
