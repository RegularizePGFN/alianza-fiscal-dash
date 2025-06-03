
// Utility functions for supervisor bonus calculations

export const SUPERVISOR_EMAIL = 'vanessa.martins@socialcriativo.com';

export interface SupervisorBonus {
  amount: number;
  tier: string;
  teamTotalSales: number;
}

export function calculateSupervisorBonus(teamTotalSales: number): SupervisorBonus {
  let amount = 0;
  let tier = '';

  if (teamTotalSales >= 100000) {
    amount = 2000;
    tier = 'Acima de R$ 100.000';
  } else if (teamTotalSales >= 70000) {
    amount = 1000;
    tier = 'R$ 70.000 - R$ 100.000';
  } else if (teamTotalSales >= 50000) {
    amount = 500;
    tier = 'R$ 50.000 - R$ 70.000';
  } else {
    amount = 0;
    tier = 'Abaixo de R$ 50.000';
  }

  return {
    amount,
    tier,
    teamTotalSales
  };
}

export function isSupervisor(userEmail: string): boolean {
  return userEmail === SUPERVISOR_EMAIL;
}
