import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useScheduledMessagesProcessor = () => {
  const processScheduledMessages = useCallback(async () => {
    try {
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

      console.log('Scheduled messages processed successfully');
    } catch (error) {
      console.error('Error processing scheduled messages:', error);
    }
  }, []);

  useEffect(() => {
    // Processar mensagens a cada 30 segundos para ser mais responsivo
    const interval = setInterval(processScheduledMessages, 30000);
    
    // Processar imediatamente ao carregar
    processScheduledMessages();

    return () => clearInterval(interval);
  }, [processScheduledMessages]);

  return { processScheduledMessages };
};