import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Global lock para evitar execuções simultâneas
let isProcessingRecurringGlobally = false;

export const useRecurringMessagesProcessor = () => {
  const isProcessingRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const processRecurringMessages = useCallback(async () => {
    // Verifica se já está processando (local ou globalmente)
    if (isProcessingRef.current || isProcessingRecurringGlobally) {
      console.log('🚫 Skipping recurring messages processing - already running');
      return;
    }

    try {
      isProcessingRef.current = true;
      isProcessingRecurringGlobally = true;

      console.log('🔄 Processing recurring messages...');
      
      const { data, error } = await supabase.functions.invoke('process-recurring-messages', {
        body: {}
      });

      if (error) {
        console.error('❌ Error processing recurring messages:', error);
      } else {
        console.log('✅ Recurring messages processed successfully:', data);
      }
    } catch (error) {
      console.error('❌ Unexpected error in recurring messages processing:', error);
    } finally {
      isProcessingRef.current = false;
      isProcessingRecurringGlobally = false;
    }
  }, []);

  useEffect(() => {
    // Processa imediatamente após um pequeno delay
    const timeoutId = setTimeout(() => {
      processRecurringMessages();
    }, 2000);

    // Configura interval para processar a cada 60 segundos
    intervalRef.current = setInterval(() => {
      processRecurringMessages();
    }, 60000); // 60 segundos

    return () => {
      clearTimeout(timeoutId);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [processRecurringMessages]);

  return {
    processRecurringMessages
  };
};