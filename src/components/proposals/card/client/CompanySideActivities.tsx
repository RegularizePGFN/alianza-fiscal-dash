
import React from 'react';
import { Briefcase } from 'lucide-react';
import { CompanyData } from "@/lib/types/proposals";

interface CompanySideActivitiesProps {
  sideActivities?: {
    id: number;
    text: string;
  }[];
}

const CompanySideActivities = ({ sideActivities }: CompanySideActivitiesProps) => {
  if (!sideActivities || sideActivities.length === 0) return null;
  
  return (
    <div className="mt-2 pt-2 border-t border-af-blue-100">
      <div className="flex items-center text-af-blue-700 font-medium mb-1">
        <Briefcase className="h-4 w-4 mr-2" />
        Atividades Secundárias:
      </div>
      <ul className="pl-6">
        {sideActivities.map((activity, index) => (
          <li key={index} className="text-sm mb-1">• {activity.id} | {activity.text}</li>
        ))}
      </ul>
    </div>
  );
};

export default CompanySideActivities;
