
import { useEffect } from 'react';

interface UseUserDataProps {
  user: any;
  setFormData: (formData: any) => void;
}

export const useUserData = ({ user, setFormData }: UseUserDataProps) => {
  // Set user data when component mounts or user changes
  useEffect(() => {
    if (user) {
      setFormData((prevData: any) => ({
        ...prevData,
        // Set the seller name from the user's profile name
        sellerName: user.name || 'Nome do Especialista',
        sellerEmail: user.email || '',
      }));
    }
  }, [user, setFormData]);
};
