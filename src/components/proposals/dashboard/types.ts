
export interface ProposalData {
  id: string;
  user_id: string;
  created_at: string;
  total_debt: number;
  discounted_value: number;
  fees_value: number;
}

export interface UserData {
  id: string;
  name: string;
}

export interface DailyProposalCount {
  date: string;
  formattedDate: string;
  count: number;
  fees: number;
}

export interface UserProposalStats {
  name: string;
  count: number;
  fees: number;
  color: string;
}

export interface SummaryStats {
  total: number;
  totalFees: number;
  averageFees: number;
}
