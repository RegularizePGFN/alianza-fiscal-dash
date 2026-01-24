
## Plano: Corrigir Busca de Dados para Usar Período Configurado

### Problema Identificado
A função `get_weekly_ranking` está **hardcoded** para calcular a semana atual:
```sql
week_start := date_trunc('week', CURRENT_DATE)::date;
week_end := week_start + interval '6 days';
```

Isso ignora completamente as datas `start_date` e `end_date` configuradas na tabela `motivational_settings` (12/01 a 30/01).

### Resultado Atual (Incorreto)
- **Período configurado**: 12/01 a 30/01
- **Dados buscados**: 19/01 a 25/01 (semana atual)
- **Ranking mostra**: Felipe Santos R$ 3.993,17 (apenas dados da semana 4)
- **Deveria mostrar**: Total do período inteiro (semanas 2, 3, 4, 5)

---

### Solução

#### 1. Atualizar a Função RPC (Nova Migration)

Modificar `get_weekly_ranking` para aceitar parâmetros de data opcionais:

```sql
CREATE OR REPLACE FUNCTION public.get_weekly_ranking(
  p_start_date date DEFAULT NULL,
  p_end_date date DEFAULT NULL
)
RETURNS TABLE (...)
AS $function$
DECLARE
  week_start date;
  week_end date;
BEGIN
  -- Se datas não fornecidas, buscar das configurações
  IF p_start_date IS NULL OR p_end_date IS NULL THEN
    SELECT start_date, end_date INTO week_start, week_end
    FROM motivational_settings LIMIT 1;
  ELSE
    week_start := p_start_date;
    week_end := p_end_date;
  END IF;
  
  -- Fallback para semana atual se ainda não houver datas
  IF week_start IS NULL THEN
    week_start := date_trunc('week', CURRENT_DATE)::date;
    week_end := week_start + interval '6 days';
  END IF;
  
  -- Resto da query continua igual...
END;
```

---

#### 2. Atualizar o Hook `useMotivationalRanking`

**Arquivo**: `src/hooks/useMotivationalRanking.ts`

Modificar para passar as datas das configurações para a RPC:

```typescript
export function useMotivationalRanking(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["motivational-ranking", startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_weekly_ranking", {
        p_start_date: startDate || null,
        p_end_date: endDate || null
      });
      
      if (error) throw error;
      return (data || []) as RankingEntry[];
    },
    // ...
  });
}
```

---

#### 3. Atualizar a Chamada no AppHeader

**Arquivo**: `src/components/layout/AppHeader.tsx`

Passar as datas das configurações para o hook:

```typescript
const { data: settings } = useMotivationalSettings();
const { data: ranking } = useMotivationalRanking(
  settings?.start_date || undefined,
  settings?.end_date || undefined
);
```

---

### Fluxo Corrigido

```text
┌──────────────────────────────────────────────────────────────────┐
│ Configurações Admin                                              │
│ start_date: 12/01/2026 | end_date: 30/01/2026                    │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ useMotivationalRanking(start_date, end_date)                     │
│ Passa datas para a RPC                                           │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ get_weekly_ranking(p_start_date, p_end_date)                     │
│ Filtra vendas: WHERE sale_date >= 12/01 AND sale_date <= 30/01  │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ Resultado Correto                                                │
│ Lívia Pereira: 71 contratos, R$ 15.799,61 (total do período)     │
└──────────────────────────────────────────────────────────────────┘
```

---

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| Nova migration SQL | Atualizar função RPC para aceitar parâmetros de data |
| `src/hooks/useMotivationalRanking.ts` | Aceitar datas como parâmetros e passar para RPC |
| `src/components/layout/AppHeader.tsx` | Passar `start_date` e `end_date` das configurações para o hook |

---

### Seção Técnica

#### Migration SQL Completa
```sql
CREATE OR REPLACE FUNCTION public.get_weekly_ranking(
  p_start_date date DEFAULT NULL,
  p_end_date date DEFAULT NULL
)
RETURNS TABLE (
  salesperson_id uuid,
  salesperson_name text,
  contracts_count bigint,
  total_amount numeric,
  volume_position integer,
  amount_position integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  period_start date;
  period_end date;
BEGIN
  -- Usar parâmetros se fornecidos
  IF p_start_date IS NOT NULL AND p_end_date IS NOT NULL THEN
    period_start := p_start_date;
    period_end := p_end_date;
  ELSE
    -- Buscar das configurações motivacionais
    SELECT start_date, end_date INTO period_start, period_end
    FROM motivational_settings LIMIT 1;
    
    -- Fallback para semana atual
    IF period_start IS NULL OR period_end IS NULL THEN
      period_start := date_trunc('week', CURRENT_DATE)::date;
      period_end := period_start + interval '6 days';
    END IF;
  END IF;
  
  RETURN QUERY
  WITH sales_data AS (
    SELECT 
      s.salesperson_id,
      COALESCE(p.name, s.salesperson_name, 'Desconhecido') as name,
      COUNT(*)::bigint as contracts,
      COALESCE(SUM(s.gross_amount), 0) as amount
    FROM sales s
    LEFT JOIN profiles p ON p.id = s.salesperson_id
    WHERE s.sale_date >= period_start 
      AND s.sale_date <= period_end
    GROUP BY s.salesperson_id, p.name, s.salesperson_name
  ),
  ranked_data AS (
    SELECT 
      sd.salesperson_id,
      sd.name,
      sd.contracts,
      sd.amount,
      ROW_NUMBER() OVER (ORDER BY sd.contracts DESC, sd.amount DESC)::integer as vol_pos,
      ROW_NUMBER() OVER (ORDER BY sd.amount DESC, sd.contracts DESC)::integer as amt_pos
    FROM sales_data sd
  )
  SELECT 
    rd.salesperson_id,
    rd.name,
    rd.contracts,
    rd.amount,
    rd.vol_pos,
    rd.amt_pos
  FROM ranked_data rd
  ORDER BY rd.vol_pos;
END;
$function$;
```

---

### Resultado Esperado

Após a correção:
- **Lívia Pereira** aparecerá em 1º lugar com **R$ 15.799,61** (total do período 12/01 a 30/01)
- O ranking refletirá corretamente os dados de todas as semanas dentro do período configurado
