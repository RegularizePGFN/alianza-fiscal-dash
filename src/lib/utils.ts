
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { PaymentMethod } from "./types"
import { COMMISSION_RATE_BELOW_GOAL, COMMISSION_RATE_ABOVE_GOAL, COMMISSION_GOAL_AMOUNT } from './constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency values to BRL
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

// Enhanced format date function to handle different date formats consistently
export function formatDate(date: Date | string): string {
  if (!date) return '';
  
  try {
    // For debugging
    console.log("formatDate input:", date, typeof date);
    
    // Handle YYYY-MM-DD format (from database)
    if (typeof date === 'string') {
      // Check if it's in YYYY-MM-DD format
      if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = date.split('-').map(Number);
        // Create date using local timezone explicitly
        const localDate = new Date(year, month - 1, day);
        console.log("YYYY-MM-DD string parsed to local date:", localDate);
        return new Intl.DateTimeFormat('pt-BR').format(localDate);
      }
    }
    
    // Handle Date objects or other date string formats
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const result = new Intl.DateTimeFormat('pt-BR').format(dateObj);
    console.log("Formatted date result:", result);
    return result;
    
  } catch (error) {
    console.error("Error formatting date:", error, date);
    return String(date);
  }
}

// Format percentage
export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

// Get today's date in ISO format
export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

// Get first and last day of the current month
export function getCurrentMonthDates(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { start, end };
}

// Convert date to YYYY-MM-DD format (ISO date string without time)
export function toISODateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Parse YYYY-MM-DD string to a Date object in local timezone
export function parseISODateString(dateString: string): Date {
  if (!dateString || !dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    console.warn("Invalid date string format:", dateString);
    return new Date();
  }
  
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Calculate commission based on fixed commission goal amount
export const calculateCommission = (totalSales: number, goalAmount: number) => {
  // We use the fixed COMMISSION_GOAL_AMOUNT, not the person's goal amount
  const rate = totalSales >= COMMISSION_GOAL_AMOUNT 
    ? COMMISSION_RATE_ABOVE_GOAL 
    : COMMISSION_RATE_BELOW_GOAL;
    
  const amount = totalSales * rate;
  
  return {
    rate,
    amount,
  };
};

// Calculate goal completion percentage
export function calculateGoalPercentage(totalSales: number, goalAmount: number): number {
  return Math.min(totalSales / goalAmount, 2); // Cap at 200%
}

// Convert payment method string to enum
export function convertToPaymentMethod(method: string): PaymentMethod {
  switch (method?.toLowerCase()) {
    case 'boleto':
      return PaymentMethod.BOLETO;
    case 'pix':
      return PaymentMethod.PIX;
    case 'crédito':
    case 'credito':
      return PaymentMethod.CREDIT;
    case 'débito':
    case 'debito':
      return PaymentMethod.DEBIT;
    default:
      return PaymentMethod.PIX; // Default to PIX
  }
}
