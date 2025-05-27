
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { WeekRange } from "./types";

// Calculate business day weeks for the current month
export const calculateBusinessDayWeeks = (year: number, month: number): WeekRange[] => {
  console.log(`Calculating business day weeks for ${month}/${year}`);
  
  // Get all business days in the month (Monday to Friday)
  const businessDays: Date[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  
  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month - 1, day);
    const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    // Only include Monday (1) to Friday (5)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      businessDays.push(currentDate);
    }
  }
  
  console.log(`Found ${businessDays.length} business days in ${month}/${year}`);
  
  // Group business days into weeks
  const weekRanges: WeekRange[] = [];
  let weekNumber = 1;
  let currentWeekStart = 0;
  
  while (currentWeekStart < businessDays.length) {
    const startDate = businessDays[currentWeekStart];
    const startDayOfWeek = startDate.getDay(); // 1=Monday, 2=Tuesday, etc.
    
    // Calculate how many days until Friday (or end of business days)
    let daysInThisWeek = 0;
    let currentIndex = currentWeekStart;
    
    // If we start on a day other than Monday, we might have fewer than 5 days
    for (let i = currentIndex; i < businessDays.length; i++) {
      const currentDay = businessDays[i];
      const currentDayOfWeek = currentDay.getDay();
      
      // Add this day to the current week
      daysInThisWeek++;
      currentIndex = i;
      
      // If we reach Friday or it's the last business day, end the week
      if (currentDayOfWeek === 5 || i === businessDays.length - 1) {
        break;
      }
      
      // If we have 5 business days, end the week
      if (daysInThisWeek === 5) {
        break;
      }
    }
    
    const endDate = businessDays[currentIndex];
    
    weekRanges.push({
      weekNumber,
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    });
    
    console.log(`Week ${weekNumber}: ${format(startDate, 'dd/MM', { locale: ptBR })} - ${format(endDate, 'dd/MM', { locale: ptBR })}`);
    
    weekNumber++;
    currentWeekStart = currentIndex + 1;
  }
  
  console.log(`Created ${weekRanges.length} week ranges`);
  return weekRanges;
};

// Calculate week date ranges for the current month
export const calculateWeekDateRanges = (): WeekRange[] => {
  const now = new Date();
  return calculateBusinessDayWeeks(now.getFullYear(), now.getMonth() + 1);
};
