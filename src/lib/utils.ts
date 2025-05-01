
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { PAYMENT_FEES } from "./constants"
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

// Format date to Brazilian format
export function formatDate(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return new Intl.DateTimeFormat('pt-BR').format(date);
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

// Calculate net amount after payment processor fees
export function calculateNetAmount(grossAmount: number, paymentMethod: PaymentMethod, installments: number = 1): number {
  let fee;
  
  if (paymentMethod === 'Crédito') {
    if (installments === 1) {
      fee = PAYMENT_FEES.CREDIT_1X;
    } else if (installments >= 2 && installments <= 6) {
      fee = PAYMENT_FEES.CREDIT_2X_6X;
    } else if (installments >= 7 && installments <= 12) {
      fee = PAYMENT_FEES.CREDIT_7X_12X;
    } else {
      fee = PAYMENT_FEES.CREDIT_13X_21X;
    }
  } else if (paymentMethod === 'Débito') {
    fee = PAYMENT_FEES.DEBIT;
  } else if (paymentMethod === 'Pix') {
    fee = PAYMENT_FEES.PIX;
  } else {
    fee = PAYMENT_FEES.BOLETO;
  }
  
  const percentageFee = grossAmount * fee.percentage;
  const netAmount = grossAmount - percentageFee - fee.fixed;
  
  return Math.max(0, netAmount);
}

// Calculate commission amount based on performance against goal
export function calculateCommission(netAmount: number, totalSales: number, goalAmount: number): {
  rate: number;
  amount: number;
} {
  const rate = totalSales >= goalAmount ? 0.25 : 0.2;
  const amount = netAmount * rate;
  
  return {
    rate,
    amount
  };
}

// Calculate goal completion percentage
export function calculateGoalPercentage(totalSales: number, goalAmount: number): number {
  return Math.min(totalSales / goalAmount, 2); // Cap at 200%
}
