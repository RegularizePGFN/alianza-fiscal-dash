import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { toZonedTime, format } from "https://esm.sh/date-fns-tz@3.0.0";

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

    // Get current date and time in São Paulo timezone
    const timezone = 'America/Sao_Paulo';
    const now = new Date();
    const nowInSP = toZonedTime(now, timezone);
    const today = format(nowInSP, 'yyyy-MM-dd', { timeZone: timezone }); // YYYY-MM-DD
    const currentTime = format(nowInSP, 'HH:mm', { timeZone: timezone }); // HH:MM

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
  console.log(`Checking schedule ${schedule.id} for ${schedule.client_name}`);
  console.log(`Schedule time: ${schedule.execution_time}, Current time: ${currentTime}`);
  
  // Check if already executed today, BUT only if total_executions > 0
  // This allows edited schedules with 0 executions to run even if last_execution_date is today
  if (schedule.last_execution_date === today && schedule.total_executions > 0) {
    console.log(`Already executed today: ${schedule.last_execution_date} (total executions: ${schedule.total_executions})`);
    return false;
  }

  const startDate = new Date(schedule.start_date + 'T00:00:00-03:00'); // SP timezone
  const todayDate = new Date(today + 'T00:00:00-03:00'); // SP timezone
  
  const daysSinceStart = Math.floor((todayDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  console.log(`Days since start: ${daysSinceStart}`);
  
  // Verificar se hoje é um dia válido para execução baseado no tipo de recorrência
  let shouldExecuteToday = false;
  
  switch (schedule.recurrence_type) {
    case 'daily':
      shouldExecuteToday = daysSinceStart >= 0;
      console.log(`Daily check: ${shouldExecuteToday} (days since start: ${daysSinceStart})`);
      break;
      
    case 'weekly':
      // Use SP timezone for day of week calculation
      const timezone = 'America/Sao_Paulo';
      const nowInSP = toZonedTime(new Date(), timezone);
      const todayWeekDay = nowInSP.getDay();
      const scheduleWeekDay = schedule.day_of_week;
      shouldExecuteToday = todayWeekDay === scheduleWeekDay && daysSinceStart >= 0;
      
      console.log(`Weekly check - Today: ${todayWeekDay}, Schedule: ${scheduleWeekDay}, Should execute: ${shouldExecuteToday}`);
      break;
             
    case 'monthly':
      const monthlyDayMatch = todayDate.getDate() === schedule.day_of_month;
      shouldExecuteToday = monthlyDayMatch && daysSinceStart >= 0;
      console.log(`Monthly check - Today: ${todayDate.getDate()}, Schedule: ${schedule.day_of_month}, Should execute: ${shouldExecuteToday}`);
      break;
             
    default:
      console.log(`Unknown recurrence type: ${schedule.recurrence_type}`);
      return false;
  }
  
  if (!shouldExecuteToday) {
    console.log(`Today is not a valid execution day for this schedule`);
    return false;
  }

  // Verificar se o horário já passou (executa se ainda não executou hoje e o horário já chegou)
  const scheduleTime = schedule.execution_time;
  const [scheduleHour, scheduleMinute] = scheduleTime.split(':').map(Number);
  const [currentHour, currentMinute] = currentTime.split(':').map(Number);
  
  const scheduleMinutes = scheduleHour * 60 + scheduleMinute;
  const currentMinutes = currentHour * 60 + currentMinute;
  
  console.log(`Time check - Schedule: ${scheduleMinutes} minutes, Current: ${currentMinutes} minutes`);
  
  // Se o horário atual é maior ou igual ao horário agendado, executa
  const shouldExecuteNow = currentMinutes >= scheduleMinutes;
  
  console.log(`Should execute now: ${shouldExecuteNow}`);
  return shouldExecuteNow;
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