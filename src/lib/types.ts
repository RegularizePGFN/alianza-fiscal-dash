
// User roles
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'gestor',
  SALESPERSON = 'vendedor',
}

// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at?: string;
}

// Authentication state
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}

// Payment methods - updated to match the string literals used in the code
export enum PaymentMethod {
  BOLETO = 'Boleto',
  PIX = 'Pix',
  CREDIT = 'Crédito',
  DEBIT = 'Débito',
}

// Sale interface - updated with new client fields
export interface Sale {
  id: string;
  salesperson_id: string;
  salesperson_name?: string;
  gross_amount: number;
  net_amount: number;
  payment_method: PaymentMethod;
  installments: number;
  sale_date: string;
  created_at?: string;
  client_name: string;
  client_phone: string;
  client_document: string;
}

// Commission calculation interface
export interface CommissionCalc {
  gross_amount: number;
  net_amount: number;
  commission_rate: number;
  commission_amount: number;
}

// Monthly goal interface
export interface MonthlyGoal {
  user_id: string;
  month: number;
  year: number;
  goal_amount: number;
}

// Sales summary interface
export interface SalesSummary {
  total_sales: number;
  total_gross: number;
  total_net: number;
  projected_commission: number;
  goal_amount: number;
  goal_percentage: number;
}

// Date filter interface
export interface DateFilter {
  startDate: Date;
  endDate: Date;
}
