import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { UserRole } from "@/lib/types";
import { RecurringMessageSchedule } from "@/lib/types/recurringSchedules";

export const useRecurringSchedules = (refreshTrigger: number) => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<RecurringMessageSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === UserRole.ADMIN;

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      let query = supabase.from('recurring_message_schedules').select(`
        *
      `);

      if (!isAdmin) {
        query = query.eq('user_id', user?.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error('Error fetching recurring schedules:', error);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchSchedules();
    }
  }, [user?.id, refreshTrigger]);

  return {
    schedules,
    loading,
    refetch: fetchSchedules
  };
};