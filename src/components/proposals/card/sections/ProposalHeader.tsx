import React from 'react';

interface ProposalHeaderProps {
  totalDebt?: string;
  discountedValue?: string;
}

const ProposalHeader = ({ totalDebt, discountedValue }: ProposalHeaderProps) => {
  return (
    <div
      className="rounded-t-none text-white px-[15px] py-[24px] flex justify-between items-center shadow-sm"
      style={{
        background: 'linear-gradient(135deg, #0b1d3a 0%, #14305c 100%)',
        borderBottom: '3px solid #d4c5a0',
      }}
    >
      <div className="flex items-center gap-3">
        <img
          src="/lovable-uploads/logo-alianca-fiscal.png"
          alt="Aliança Fiscal"
          className="h-10 w-auto object-contain"
        />
        <div>
          <p
            className="text-[10px] tracking-[0.25em] uppercase"
            style={{ color: '#d4c5a0' }}
          >
            Aliança Fiscal • Consultoria Tributária
          </p>
          <h2
            className="font-semibold text-lg tracking-tight my-0 py-0"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Proposta de Regularização PGFN
          </h2>
        </div>
      </div>
    </div>
  );
};

export default ProposalHeader;
