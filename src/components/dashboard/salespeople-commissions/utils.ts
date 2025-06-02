
export function getBusinessDaysInMonth(month: number, year: number): number {
  const lastDay = new Date(year, month, 0).getDate();
  let businessDays = 0;
  
  for (let day = 1; day <= lastDay; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDays++;
    }
  }
  
  return businessDays;
}

export function getBusinessDaysElapsedUntilToday(): number {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const currentDay = today.getDate();
  let businessDaysElapsed = 0;
  
  for (let day = 1; day <= currentDay; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDaysElapsed++;
    }
  }
  
  return businessDaysElapsed;
}

export function getBusinessDaysElapsedInMonth(month: number, year: number): number {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  
  // If it's a future month, no days elapsed
  if (year > currentYear || (year === currentYear && month > currentMonth)) {
    return 0;
  }
  
  // If it's a past month, all business days elapsed
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return getBusinessDaysInMonth(month, year);
  }
  
  // If it's the current month, calculate elapsed days
  const currentDay = today.getDate();
  let businessDaysElapsed = 0;
  
  for (let day = 1; day <= currentDay; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDaysElapsed++;
    }
  }
  
  return businessDaysElapsed;
}
