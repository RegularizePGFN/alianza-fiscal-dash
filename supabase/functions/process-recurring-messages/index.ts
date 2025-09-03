import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

interface RecurringSchedule {
  id: string;
  client_name: string;
  client_phone: string;
  message_text: string;
  instance_name: string;
  funnel_stage: string;
  recurrence_type: 'daily' | 'weekly' | 'monthly';
  recurrence_interval: number;
  day_of_week?: number;
  day_of_month?: number;
  execution_time: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  total_executions: number;
  last_execution_date?: string;
  next_execution_date?: string;
  user_id: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log('Processing recurring schedules...');

    // Get current date and time
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const currentTime = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM

    console.log(`Current date: ${today}, time: ${currentTime}`);

    // Fetch active recurring schedules that should be executed
    const { data: schedules, error: fetchError } = await supabase
      .from('recurring_message_schedules')
      .select('*')
      .eq('is_active', true)
      .lte('start_date', today)
      .or(`end_date.is.null,end_date.gte.${today}`);

    if (fetchError) {
      console.error('Error fetching schedules:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${schedules?.length || 0} active schedules`);

    let processedCount = 0;
    let errorCount = 0;

    for (const schedule of schedules || []) {
      try {
        // Check if it's time to execute this schedule
        const shouldExecute = await checkIfShouldExecute(schedule, today, currentTime);
        
        if (shouldExecute) {
          console.log(`Processing schedule ${schedule.id} for client ${schedule.client_name}`);
          
          // Create scheduled message
          const { error: insertError } = await supabase
            .from('scheduled_messages')
            .insert([{
              user_id: schedule.user_id,
              client_name: schedule.client_name,
              client_phone: schedule.client_phone,
              message_text: schedule.message_text,
              instance_name: schedule.instance_name,
              scheduled_date: new Date().toISOString(),
              status: 'pending'
            }]);

          if (insertError) {
            console.error(`Error creating scheduled message for ${schedule.id}:`, insertError);
            errorCount++;
            continue;
          }

          // Update the recurring schedule
          const nextExecutionDate = calculateNextExecutionDate(schedule, today);
          
          const { error: updateError } = await supabase
            .from('recurring_message_schedules')
            .update({
              total_executions: schedule.total_executions + 1,
              last_execution_date: today,
              next_execution_date: nextExecutionDate,
              updated_at: new Date().toISOString()
            })
            .eq('id', schedule.id);

          if (updateError) {
            console.error(`Error updating recurring schedule ${schedule.id}:`, updateError);
            errorCount++;
            continue;
          }

          processedCount++;
          console.log(`Successfully processed schedule ${schedule.id}`);
        }
      } catch (error) {
        console.error(`Error processing schedule ${schedule.id}:`, error);
        errorCount++;
      }
    }

    console.log(`Processing complete. Processed: ${processedCount}, Errors: ${errorCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedCount,
        errors: errorCount,
        message: `Processed ${processedCount} recurring schedules`
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error in process-recurring-messages function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});

async function checkIfShouldExecute(
  schedule: RecurringSchedule, 
  today: string, 
  currentTime: string
): Promise<boolean> {
  // Check if execution time matches (within 1 minute tolerance)
  const scheduleTime = schedule.execution_time;
  const [scheduleHour, scheduleMinute] = scheduleTime.split(':').map(Number);
  const [currentHour, currentMinute] = currentTime.split(':').map(Number);
  
  const scheduleMinutes = scheduleHour * 60 + scheduleMinute;
  const currentMinutes = currentHour * 60 + currentMinute;
  
  // Allow 1 minute tolerance
  if (Math.abs(currentMinutes - scheduleMinutes) > 1) {
    return false;
  }

  // Check if already executed today
  if (schedule.last_execution_date === today) {
    return false;
  }

  const startDate = new Date(schedule.start_date);
  const todayDate = new Date(today);
  
  const daysSinceStart = Math.floor((todayDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  switch (schedule.recurrence_type) {
    case 'daily':
      // Check if it's been the right number of days since start
      return daysSinceStart >= 0 && daysSinceStart % schedule.recurrence_interval === 0;
      
    case 'weekly':
      // Check if it's the right day of the week and interval
      const weeksSinceStart = Math.floor(daysSinceStart / 7);
      return todayDate.getDay() === schedule.day_of_week && 
             weeksSinceStart % schedule.recurrence_interval === 0;
             
    case 'monthly':
      // Check if it's the right day of the month and interval
      const monthsSinceStart = (todayDate.getFullYear() - startDate.getFullYear()) * 12 + 
                              (todayDate.getMonth() - startDate.getMonth());
      return todayDate.getDate() === schedule.day_of_month && 
             monthsSinceStart % schedule.recurrence_interval === 0;
             
    default:
      return false;
  }
}

function calculateNextExecutionDate(schedule: RecurringSchedule, currentDate: string): string {
  const current = new Date(currentDate);
  
  switch (schedule.recurrence_type) {
    case 'daily':
      current.setDate(current.getDate() + schedule.recurrence_interval);
      break;
      
    case 'weekly':
      current.setDate(current.getDate() + (7 * schedule.recurrence_interval));
      break;
      
    case 'monthly':
      current.setMonth(current.getMonth() + schedule.recurrence_interval);
      // Ensure we maintain the correct day of month
      if (schedule.day_of_month) {
        current.setDate(schedule.day_of_month);
      }
      break;
  }
  
  return current.toISOString().split('T')[0];
}