import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useCleanupCommissions() {
  const removeAutomaticCommissionCosts = async () => {
    try {
      console.log('Removendo custos de comissão automáticos duplicados...');
      
      // Remover qualquer custo de comissão criado automaticamente
      const { error } = await supabase
        .from('company_costs')
        .delete()
        .eq('name', 'Comissões dos Vendedores')
        .eq('type', 'fixed');

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found (ok)
        console.error('Erro ao remover custos de comissão:', error);
        return;
      }

      console.log('Custos de comissão automáticos removidos com sucesso');
    } catch (error) {
      console.error('Erro na limpeza de comissões:', error);
    }
  };

  useEffect(() => {
    // Executar limpeza uma única vez
    const timer = setTimeout(() => {
      removeAutomaticCommissionCosts();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return {
    removeAutomaticCommissionCosts
  };
}