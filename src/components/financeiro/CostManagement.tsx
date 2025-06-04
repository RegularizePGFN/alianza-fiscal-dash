
import { FixedCostManagement } from "./FixedCostManagement";
import { VariableCostManagement } from "./VariableCostManagement";

interface CostManagementProps {
  onCostChange: () => void;
}

export function CostManagement({ onCostChange }: CostManagementProps) {
  return (
    <div className="space-y-6">
      <FixedCostManagement onCostChange={onCostChange} />
      <div className="border-t border-gray-200 dark:border-gray-700"></div>
      <VariableCostManagement onCostChange={onCostChange} />
    </div>
  );
}
