import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Global lock para evitar execuções simultâneas
let isProcessingGlobally = false;

export const useScheduledMessagesProcessor = () => {
  const isProcessingRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const processScheduledMessages = useCallback(async () => {
    // Verifica se já está processando (local ou globalmente)
    if (isProcessingRef.current || isProcessingGlobally) {
      console.log('🚫 Skipping scheduled messages processing - already running');
      return;
    }

    try {
      isProcessingRef.current = true;
      isProcessingGlobally = true;
      
      console.log('🔄 Starting scheduled messages processing...');
      
      const response = await fetch('https://sbxltdbnqixucjoognfj.supabase.co/functions/v1/send-scheduled-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to process scheduled messages');
      }

      console.log('✅ Scheduled messages processed successfully');
    } catch (error) {
      console.error('❌ Error processing scheduled messages:', error);
    } finally {
      isProcessingRef.current = false;
      isProcessingGlobally = false;
    }
  }, []);

  useEffect(() => {
    // Limpar intervalo anterior se existir
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Processar mensagens a cada 60 segundos (aumentando o intervalo)
    intervalRef.current = setInterval(processScheduledMessages, 60000);
    
    // Processar imediatamente ao carregar (com delay para evitar conflitos)
    setTimeout(processScheduledMessages, 2000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      isProcessingRef.current = false;
    };
  }, [processScheduledMessages]);

  return { processScheduledMessages };
};