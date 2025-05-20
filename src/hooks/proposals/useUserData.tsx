
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
  // No longer automatically sets any user data
  // This is intentionally empty as we want to avoid auto-populating any fields
};
