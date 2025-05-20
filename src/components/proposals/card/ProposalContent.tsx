
import React from 'react';
import { ExtractedData, CompanyData } from "@/lib/types/proposals";
import { SignatureSection, FooterSection } from './sections';
import {
  ThemeManager,
  EconomyValueCalculator,
  SectionOrderManager,
  SectionRenderer
} from './content';

interface ProposalContentProps {
  data: Partial<ExtractedData>;
  companyData?: CompanyData | null;
  className?: string;
  isPreview?: boolean;
}

const ProposalContent = ({ data, companyData, className = "", isPreview = false }: ProposalContentProps) => {
  // We'll use a set to track which sections we've rendered to avoid duplicates
  const renderedSections = new Set<string>();

  return (
    <div className={`p-6 space-y-0 font-['Roboto',sans-serif] ${className}`}>
      <ThemeManager data={data}>
        {(colors, layout) => (
          <EconomyValueCalculator data={data}>
            {(economyValue) => (
              <SectionOrderManager layout={layout} companyData={companyData}>
                {(sectionOrder) => (
                  <>
                    {/* Render sections based on the adjusted section order */}
                    {sectionOrder.map((section, index) => (
                      <React.Fragment key={index}>
                        <SectionRenderer 
                          sectionId={section}
                          data={data}
                          companyData={companyData}
                          colors={colors}
                          economyValue={economyValue}
                          renderedSections={renderedSections}
                        />
                      </React.Fragment>
                    ))}
                    
                    {/* Always show comments at the end if they exist and aren't already in the sections */}
                    {data.additionalComments && !renderedSections.has('comments') && (
                      <SectionRenderer
                        sectionId="comments"
                        data={data}
                        companyData={companyData}
                        colors={colors}
                        economyValue={economyValue}
                        renderedSections={renderedSections}
                      />
                    )}
                    
                    {/* Signature is always shown */}
                    <SignatureSection data={data} />
                  </>
                )}
              </SectionOrderManager>
            )}
          </EconomyValueCalculator>
        )}
      </ThemeManager>
    </div>
  );
};

export default ProposalContent;
