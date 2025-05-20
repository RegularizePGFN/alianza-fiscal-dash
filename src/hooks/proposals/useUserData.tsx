
import { useEffect } from "react";
import { ExtractedData } from "@/lib/types/proposals";

interface UseUserDataProps {
  user: any;
  setFormData: (formData: Partial<ExtractedData> | ((prev: Partial<ExtractedData>) => Partial<ExtractedData>)) => void;
}

export const useUserData = ({
  user,
  setFormData
}: UseUserDataProps) => {
  
  // Only set the specialist name, nothing else
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        // Only set specialistName, no client data
        specialistName: user.name || ''
      }));
    }
  }, [user]);
};
