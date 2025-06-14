
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const SkeletonProposalCard = () => (
  <div className="border rounded-lg shadow-sm bg-af-blue-50/40 p-4 animate-pulse space-y-4 w-full max-w-2xl mx-auto">
    <div className="flex items-center gap-3">
      <Skeleton className="h-9 w-9 rounded bg-af-blue-200" />
      <Skeleton className="h-7 w-2/3" />
    </div>
    <Skeleton className="h-5 w-1/3" />
    <Skeleton className="h-44 w-full" />
    <div className="flex gap-2">
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-8 w-24" />
    </div>
  </div>
);

export default SkeletonProposalCard;
