
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PaymentMethod } from "./types"
import { 
  COMMISSION_RATE_PJ_BELOW_GOAL, 
  COMMISSION_RATE_PJ_ABOVE_GOAL, 
  COMMISSION_RATE_CLT_BELOW_GOAL,
  COMMISSION_RATE_CLT_ABOVE_GOAL,
  COMMISSION_GOAL_AMOUNT,
  CONTRACT_TYPE_PJ,
  CONTRACT_TYPE_CLT
} from './constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency values to BRL
export function formatCurrency(value: string | number): string {
  if (typeof value === 'string') {
    // Remove non-numeric characters except for decimal point and handle thousands separators
    value = parseFloat(value.replace(/\./g, '').replace(',', '.'));
  }
  
  if (isNaN(value as number)) {
    return 'R$ 0,00';
  }
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value as number);
}

// Format Brazilian currency (added this function)
export function formatBrazilianCurrency(value: string | number): string {
  if (typeof value === 'string') {
    // Remove non-numeric characters except for decimal point and handle thousands separators
    value = parseFloat(value.replace(/\./g, '').replace(',', '.'));
  }
  
  if (isNaN(value as number)) {
    return '0,00';
  }
  
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value as number);
}

// Enhanced format date function to handle different date formats consistently
export function formatDate(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: ptBR });
  } catch (e) {
    console.error('Error formatting date:', e);
    return typeof date === 'string' ? date : date.toISOString();
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

// Calculate commission based on contract type (PJ or CLT)
export const calculateCommission = (totalSales: number, contractType: string = CONTRACT_TYPE_PJ) => {
  let belowGoalRate: number;
  let aboveGoalRate: number;
  
  if (contractType === CONTRACT_TYPE_CLT) {
    belowGoalRate = COMMISSION_RATE_CLT_BELOW_GOAL;
    aboveGoalRate = COMMISSION_RATE_CLT_ABOVE_GOAL;
  } else {
    belowGoalRate = COMMISSION_RATE_PJ_BELOW_GOAL;
    aboveGoalRate = COMMISSION_RATE_PJ_ABOVE_GOAL;
  }
  
  const rate = totalSales >= COMMISSION_GOAL_AMOUNT ? aboveGoalRate : belowGoalRate;
  const amount = totalSales * rate;
  
  return {
    rate,
    amount,
    contractType
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
