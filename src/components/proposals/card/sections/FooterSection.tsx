
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";

interface FooterSectionProps {
  data: Partial<ExtractedData>;
}

const FooterSection = ({ data }: FooterSectionProps) => {
  return (
    <div className="rounded-b-none bg-af-blue-700 text-white h-2 mt-4">
      {/* This is just a thin blue bar at the bottom of the proposal */}
    </div>
  );
};

export default FooterSection;
