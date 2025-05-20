
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";

interface FooterSectionProps {
  data: Partial<ExtractedData>;
}

const FooterSection = ({ data }: FooterSectionProps) => {
  // Don't show footer at all since signature is always shown
  return null;
};

export default FooterSection;
