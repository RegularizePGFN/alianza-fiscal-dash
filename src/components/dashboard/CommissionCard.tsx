
import { Sale } from "@/lib/types";
import { CommissionCard as NewCommissionCard } from "./commission-card";

interface CommissionCardProps {
  totalSales: number;
  goalAmount: number;
  salesData: Sale[];
}

// This file is now just a wrapper for the new implementation
// This ensures backward compatibility while we transition to the new component structure
export function CommissionCard(props: CommissionCardProps) {
  return <NewCommissionCard {...props} />;
}
