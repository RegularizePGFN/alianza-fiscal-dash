import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log('🔄 Starting recurring schedules processing...');
    const currentDate = new Date();
    const today = currentDate.toISOString().split('T')[0];
    
    console.log('📅 Processing date:', today);

    // Buscar agendamentos recorrentes ativos que devem ser executados hoje
    const { data: activeSchedules, error: fetchError } = await supabase
      .from('recurring_schedules')
      .select('*')
      .eq('is_active', true)
      .lte('next_execution_date', today)
      .order('next_execution_date', { ascending: true });

    if (fetchError) {
      console.error('❌ Error fetching recurring schedules:', fetchError);
      throw fetchError;
    }

    console.log(`📋 Found ${activeSchedules?.length || 0} schedules to process`);

    if (!activeSchedules || activeSchedules.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No recurring schedules to process',
          processedCount: 0 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    let processedCount = 0;
    let errorCount = 0;

    for (const schedule of activeSchedules) {
      try {
        console.log(`⏰ Processing schedule ${schedule.id} for client ${schedule.client_name}`);

        // Verificar se já existe um agendamento para hoje
        const { data: existingScheduled } = await supabase
          .from('scheduled_messages')
          .select('id')
          .eq('client_phone', schedule.client_phone)
          .eq('message_text', schedule.message_text)
          .eq('instance_name', schedule.instance_name)
          .gte('scheduled_date', `${today} 00:00:00`)
          .lt('scheduled_date', `${today} 23:59:59`)
          .limit(1);

        if (existingScheduled && existingScheduled.length > 0) {
          console.log(`⚠️ Message already scheduled for today for client ${schedule.client_name}`);
          
          // Calcular próxima execução mesmo assim
          const nextExecution = calculateNextExecution(schedule);
          await updateScheduleNextExecution(supabase, schedule.id, nextExecution, schedule.executions_count + 1);
          continue;
        }

        // Criar novo agendamento pontual para hoje às 09:00
        const scheduledDate = new Date(currentDate);
        scheduledDate.setHours(9, 0, 0, 0);

        const { error: insertError } = await supabase
          .from('scheduled_messages')
          .insert({
            user_id: schedule.user_id,
            client_name: schedule.client_name,
            client_phone: schedule.client_phone,
            message_text: schedule.message_text,
            instance_name: schedule.instance_name,
            scheduled_date: scheduledDate.toISOString(),
            status: 'pending',
            requires_approval: false
          });

        if (insertError) {
          console.error(`❌ Error creating scheduled message for ${schedule.client_name}:`, insertError);
          errorCount++;
          continue;
        }

        console.log(`✅ Created scheduled message for ${schedule.client_name}`);

        // Calcular próxima execução
        const nextExecution = calculateNextExecution(schedule);
        const newExecutionCount = schedule.executions_count + 1;

        // Verificar se deve desativar o agendamento
        let shouldDeactivate = false;
        
        if (schedule.total_occurrences && newExecutionCount >= schedule.total_occurrences) {
          shouldDeactivate = true;
          console.log(`🏁 Schedule ${schedule.id} reached total occurrences limit`);
        }
        
        if (schedule.end_date && nextExecution > new Date(schedule.end_date)) {
          shouldDeactivate = true;
          console.log(`🏁 Schedule ${schedule.id} passed end date`);
        }

        // Atualizar o agendamento recorrente
        await updateScheduleNextExecution(
          supabase, 
          schedule.id, 
          shouldDeactivate ? null : nextExecution, 
          newExecutionCount,
          shouldDeactivate,
          today
        );

        processedCount++;

      } catch (scheduleError) {
        console.error(`❌ Error processing schedule ${schedule.id}:`, scheduleError);
        errorCount++;
      }
    }

    console.log(`✅ Processing complete. Processed: ${processedCount}, Errors: ${errorCount}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${processedCount} recurring schedules${errorCount > 0 ? ` with ${errorCount} errors` : ''}`,
        processedCount,
        errorCount
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('❌ Fatal error in recurring schedules processing:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

function calculateNextExecution(schedule: any): Date {
  const currentNext = new Date(schedule.next_execution_date);
  const nextDate = new Date(currentNext);
  
  switch (schedule.recurrence_type) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + schedule.recurrence_interval);
      break;
      
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + (7 * schedule.recurrence_interval));
      break;
      
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + schedule.recurrence_interval);
      
      // Ajustar para o dia correto do mês
      if (schedule.day_of_month) {
        const lastDayOfMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
        const targetDay = Math.min(schedule.day_of_month, lastDayOfMonth);
        nextDate.setDate(targetDay);
      }
      break;
      
    default:
      throw new Error(`Unknown recurrence type: ${schedule.recurrence_type}`);
  }
  
  return nextDate;
}

async function updateScheduleNextExecution(
  supabase: any, 
  scheduleId: string, 
  nextExecution: Date | null, 
  executionCount: number,
  deactivate: boolean = false,
  lastExecutionDate?: string
) {
  const updateData: any = {
    executions_count: executionCount,
    updated_at: new Date().toISOString()
  };

  if (lastExecutionDate) {
    updateData.last_execution_date = lastExecutionDate;
  }

  if (deactivate) {
    updateData.is_active = false;
    console.log(`⏸️ Deactivating schedule ${scheduleId}`);
  } else if (nextExecution) {
    updateData.next_execution_date = nextExecution.toISOString().split('T')[0];
  }

  const { error } = await supabase
    .from('recurring_schedules')
    .update(updateData)
    .eq('id', scheduleId);

  if (error) {
    console.error(`❌ Error updating schedule ${scheduleId}:`, error);
    throw error;
  }

  console.log(`📅 Updated schedule ${scheduleId} - Next execution: ${nextExecution ? nextExecution.toISOString().split('T')[0] : 'deactivated'}`);
}