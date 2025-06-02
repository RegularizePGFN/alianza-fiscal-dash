
// Default goal amount for salespeople
export const DEFAULT_GOAL_AMOUNT = 10000;

// Fixed commission goal amount - triggers the higher commission rate
export const COMMISSION_GOAL_AMOUNT = 10000;

// Commission rates for PJ (Pessoa Jurídica) - current system
export const COMMISSION_RATE_PJ_BELOW_GOAL = 0.2; // 20%
export const COMMISSION_RATE_PJ_ABOVE_GOAL = 0.25; // 25%

// Commission rates for CLT (Consolidação das Leis do Trabalho) - new system
export const COMMISSION_RATE_CLT_BELOW_GOAL = 0.05; // 5%
export const COMMISSION_RATE_CLT_ABOVE_GOAL = 0.1; // 10%

// Legacy constants for backward compatibility
export const COMMISSION_RATE_BELOW_GOAL = COMMISSION_RATE_PJ_BELOW_GOAL;
export const COMMISSION_RATE_ABOVE_GOAL = COMMISSION_RATE_PJ_ABOVE_GOAL;

// Contract types
export const CONTRACT_TYPE_PJ = 'PJ';
export const CONTRACT_TYPE_CLT = 'CLT';

// Payment processing fees (Asaas)
export const PAYMENT_FEES = {
  // Credit card fees
  CREDIT_1X: { percentage: 0.0299, fixed: 0.49 },  // 1x
  CREDIT_2X_6X: { percentage: 0.0349, fixed: 0.49 }, // 2-6x
  CREDIT_7X_12X: { percentage: 0.0399, fixed: 0.49 }, // 7-12x
  CREDIT_13X_21X: { percentage: 0.0429, fixed: 0.49 }, // 13-21x
  
  // Debit card fee
  DEBIT: { percentage: 0.0189, fixed: 0.35 },
  
  // Pix and Boleto fees (fixed value per transaction)
  PIX: { percentage: 0, fixed: 1.99 },
  BOLETO: { percentage: 0, fixed: 1.99 },
};

// Payment method options
export const PAYMENT_METHODS = [
  { value: 'Boleto', label: 'Boleto' },
  { value: 'Pix', label: 'Pix' },
  { value: 'Crédito', label: 'Cartão de Crédito' },
  { value: 'Débito', label: 'Cartão de Débito' },
];

// Installment options for credit card
export const INSTALLMENT_OPTIONS = Array.from({ length: 21 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1}x`,
}));

// Mock data for initial development (will be replaced with Supabase data)
export const MOCK_USERS = [
  { id: '1', name: 'Admin User', email: 'admin@aliancafiscal.com', role: 'admin' },
  { id: '2', name: 'Gestor Comercial', email: 'gestor@aliancafiscal.com', role: 'gestor' },
  { id: '3', name: 'Vendedor Silva', email: 'silva@aliancafiscal.com', role: 'vendedor' },
  { id: '4', name: 'Vendedor Santos', email: 'santos@aliancafiscal.com', role: 'vendedor' },
];
