
import { useState } from "react";
import { FixedCostManagement } from "./FixedCostManagement";
import { VariableCostManagement } from "./VariableCostManagement";

interface CostManagementProps {
  onCostChange: () => void;
}

export function CostManagement({ onCostChange }: CostManagementProps) {
  return (
    <div className="space-y-8">
      <FixedCostManagement onCostChange={onCostChange} />
      <VariableCostManagement onCostChange={onCostChange} />
    </div>
  );
}
