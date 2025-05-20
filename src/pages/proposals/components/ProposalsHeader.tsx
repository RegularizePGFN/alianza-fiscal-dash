
import React from "react";
import { Briefcase } from "lucide-react";

const ProposalsHeader = () => {
  return <div className="mb-0 flex items-center">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2 text-af-blue-700">
          <Briefcase className="h-6 w-6 text-af-blue-600" />
          Propostas
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-medium">
            beta
          </span>
        </h1>
        <p className="text-muted-foreground">
          Crie, gerencie e exporte propostas de parcelamento PGFN.
        </p>
      </div>
    </div>;
};

export default ProposalsHeader;
