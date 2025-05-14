
import { useState, useEffect } from "react";
import { SalespersonCommission, fetchSalespeopleCommissions } from "@/services/salespeople";

export function useSalespeopleCommissions() {
  const [salespeople, setSalespeople] = useState<SalespersonCommission[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await fetchSalespeopleCommissions();
      setSalespeople(data);
      setLoading(false);
    };
    
    fetchData();
  }, []);
  
  return { salespeople, loading };
}
