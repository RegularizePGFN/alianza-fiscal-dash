
import { WeeklyDataResult } from "./types";

export const getColor = (position: number) => {
  switch (position) {
    case 1: return "bg-amber-500 dark:bg-amber-600";
    case 2: return "bg-slate-400 dark:bg-slate-500";
    case 3: return "bg-amber-700 dark:bg-amber-800";
    default: return "bg-slate-200 dark:bg-slate-700";
  }
};
  
export const getGoalStatusColor = (
  personId: string, 
  week: number, 
  amount: number, 
  weeklyGoals: WeeklyDataResult["weeklyGoals"]
) => {
  if (!weeklyGoals[personId] || !weeklyGoals[personId][week]) return "";
  
  const goal = weeklyGoals[personId][week];
  
  if (amount >= goal) {
    return "bg-green-100 dark:bg-green-900/20"; // Light green for goal achieved
  } else {
    return "bg-red-100 dark:bg-red-900/20"; // Light red for goal not achieved
  }
};

export const getGoalStatusTextColor = (
  personId: string, 
  week: number, 
  amount: number, 
  weeklyGoals: WeeklyDataResult["weeklyGoals"]
) => {
  if (!weeklyGoals[personId] || !weeklyGoals[personId][week]) return "";
  
  const goal = weeklyGoals[personId][week];
  
  if (amount >= goal) {
    return "text-green-600 dark:text-green-500 font-medium"; // Green text for goal achieved
  } else {
    return "text-red-600 dark:text-red-500 font-medium"; // Red text for goal not achieved
  }
};
