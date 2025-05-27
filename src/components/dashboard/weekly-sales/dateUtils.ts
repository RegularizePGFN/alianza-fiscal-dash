
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { WeekRange } from "./types";

// Calculate which week a given date belongs to
export const getWeekNumberForDate = (date: Date | string, weekRanges: WeekRange[]): number | null => {
  // Handle both Date objects and date strings
  let dateToCheck: Date;
  if (typeof date === 'string') {
    // Parse the date string (format: YYYY-MM-DD)
    dateToCheck = parseISO(date);
  } else {
    dateToCheck = date;
  }
  
  console.log(`Checking date ${format(dateToCheck, 'dd/MM/yyyy')} against week ranges`);
  
  for (const range of weekRanges) {
    const startDate = new Date(range.startDate);
    const endDate = new Date(range.endDate);
    
    // Set time to beginning of start date and end of end date for accurate comparison
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    
    console.log(`  Week ${range.weekNumber}: ${format(startDate, 'dd/MM/yyyy')} to ${format(endDate, 'dd/MM/yyyy')}`);
    
    if (dateToCheck >= startDate && dateToCheck <= endDate) {
      console.log(`  -> Date belongs to week ${range.weekNumber}`);
      return range.weekNumber;
    }
  }
  
  console.log(`  -> Date does not belong to any week`);
  return null;
};

// Format date range as "d-d MMM" (e.g., "1-5 mai")
export const formatWeekRange = (range: WeekRange): string => {
  const startDay = format(range.startDate, 'd', { locale: ptBR });
  const endDay = format(range.endDate, 'd', { locale: ptBR });
  const month = format(range.endDate, 'MMM', { locale: ptBR });
  
  return `${startDay}-${endDay} ${month}`;
};
