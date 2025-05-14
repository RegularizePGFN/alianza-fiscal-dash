
/**
 * Returns the number of business days in a month
 */
export function getBusinessDaysInMonth(month: number, year: number): number {
  let count = 0;
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month - 1, i);
    const day = date.getDay();
    if (day !== 0 && day !== 6) count++;
  }
  return count;
}

/**
 * Returns the number of business days elapsed until today
 */
export function getBusinessDaysElapsedUntilToday(): number {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  let count = 0;
  while (start <= today) {
    const dayOfWeek = start.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    start.setDate(start.getDate() + 1);
  }
  return count;
}
