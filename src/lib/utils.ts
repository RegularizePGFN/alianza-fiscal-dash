
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

// Calculate net amount after payment processor fees - UPDATED with corrected rules
export function calculateNetAmount(grossAmount: number, paymentMethod: PaymentMethod, installments: number = 1): number {
  let netAmount = 0;
  
  // Apply the correct fee rules according to payment method
  if (paymentMethod === PaymentMethod.CREDIT) {
    // Credit card: 1.9% for single payment, 2.39% for installments
    const feeRate = installments > 1 ? 0.0239 : 0.019;
    netAmount = grossAmount * (1 - feeRate);
  } 
  else if (paymentMethod === PaymentMethod.BOLETO || paymentMethod === PaymentMethod.PIX) {
    // Boleto and PIX: 5.79% fee
    netAmount = grossAmount * (1 - 0.0579);
  }
  else if (paymentMethod === PaymentMethod.DEBIT) {
    // Debit card: 1.89% + R$0.35 fixed fee
    netAmount = grossAmount * (1 - 0.0189) - 0.35;
  }
  
  return Math.max(0, netAmount); // Prevent negative values
}

// Calculate commission amount based on performance against goal - UPDATED
export function calculateCommission(netAmount: number, totalSales: number, goalAmount: number): {
  rate: number;
  amount: number;
} {
  // Commission rate depends on whether the goal was met (based on NET total sales)
  const rate = totalSales >= goalAmount ? 0.25 : 0.2;
  
  // Commission is always calculated on the net amount (after fees)
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
