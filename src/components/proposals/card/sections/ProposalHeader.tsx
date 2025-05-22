import React from 'react';
interface ProposalHeaderProps {
  totalDebt?: string;
  discountedValue?: string;
}
const ProposalHeader = ({
  totalDebt,
  discountedValue
}: ProposalHeaderProps) => {
  return <div className="rounded-t-none bg-af-blue-700 text-white p-3 flex justify-between items-center shadow-sm px-[15px] py-[30px]">
      <div className="flex items-center gap-2">
        <img src="/lovable-uploads/d939ccfc-a061-45e8-97e0-1fa1b82d3df2.png" alt="Aliança Fiscal" className="h-8 w-auto object-contain" />
        <div>
          <h2 className="font-semibold text-lg tracking-tight">Proposta de Regularização • PGFN</h2>
          <p className="text-xs text-af-blue-100 py-0 my-0">Aliança Fiscal</p>
        </div>
      </div>
    </div>;
};
export default ProposalHeader;