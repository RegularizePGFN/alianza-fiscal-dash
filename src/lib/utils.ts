
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { PaymentMethod } from "./types"

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

// Format date to Brazilian format with improved timezone handling
export function formatDate(date: Date | string): string {
  if (!date) return '';
  
  try {
    if (typeof date === 'string') {
      // Handle date strings in ISO format (YYYY-MM-DD)
      if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = date.split('-').map(Number);
        // Create date with UTC to avoid timezone shifts
        const utcDate = new Date(Date.UTC(year, month - 1, day));
        return new Intl.DateTimeFormat('pt-BR').format(utcDate);
      }
      
      // For other string formats, try to parse without timezone shifts
      const parsedDate = new Date(date);
      return new Intl.DateTimeFormat('pt-BR').format(parsedDate);
    }
    
    // For Date objects, use a method that prevents timezone adjustments
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const utcDate = new Date(Date.UTC(year, month, day));
    return new Intl.DateTimeFormat('pt-BR').format(utcDate);
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

// Calculate commission amount based on performance against goal - SIMPLIFIED
export function calculateCommission(totalSales: number, goalAmount: number): {
  rate: number;
  amount: number;
} {
  // Commission rate depends on whether the goal was met
  const rate = totalSales >= goalAmount ? 0.25 : 0.2;
  
  // Commission is calculated directly on the sales amount (which is now the final amount)
  const amount = totalSales * rate;
  
  return {
    rate,
    amount
  };
}

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
