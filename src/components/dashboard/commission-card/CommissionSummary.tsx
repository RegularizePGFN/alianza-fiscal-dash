
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { COMMISSION_GOAL_AMOUNT } from "@/lib/constants";

interface CommissionSummaryProps {
  commissionAmount: number;
  commissionRate: number;
  isCommissionGoalMet: boolean;
}

export function CommissionSummary({
  commissionAmount,
  commissionRate,
  isCommissionGoalMet
}: CommissionSummaryProps) {
  return (
    <>
      <div className="flex justify-between items-end">
        <span className="text-2xl font-bold">{formatCurrency(commissionAmount)}</span>
        <span className={`text-lg font-semibold ${isCommissionGoalMet ? 'text-af-green-500' : 'text-primary'}`}>
          {formatPercentage(commissionRate)}
        </span>
      </div>
      
      <div className="text-sm text-muted-foreground">
        {isCommissionGoalMet ? (
          <p>
            Parabéns! Você atingiu a meta de comissão e está recebendo a taxa de comissão mais alta de {formatPercentage(commissionRate)}.
          </p>
        ) : (
          <p>
            Taxa atual: {formatPercentage(commissionRate)}. 
            Atinja R$ {COMMISSION_GOAL_AMOUNT.toLocaleString('pt-BR')} em vendas para aumentar para 25%.
          </p>
        )}
      </div>
    </>
  );
}
