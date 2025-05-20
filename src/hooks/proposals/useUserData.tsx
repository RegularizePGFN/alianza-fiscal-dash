
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
  
  // Add user data to form - exceto o nome para razão social
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        // Removido o clientName: user.name para evitar preenchimento indevido
        clientEmail: user.email || '',
        clientPhone: '', // User can fill this if needed
        specialistName: user.name || ''
      }));
    }
  }, [user]);
};
