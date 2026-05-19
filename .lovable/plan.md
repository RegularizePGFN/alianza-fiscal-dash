# Som de "moedinha" ao registrar uma venda

Adicionar um efeito sonoro tipo caixa-registradora ("ka-ching") e um toast quando uma nova venda for inserida na tabela `sales`, em tempo real para todos os usuários logados (admin, backoffice e vendedores).

Hoje já existe `useRegistrationsRealtimeSound` para cadastros (toca um chime sintetizado via Web Audio API). Vou seguir exatamente o mesmo padrão para vendas — sem MP3 externo, então não precisa subir asset.

## O que fazer

1. **Criar `src/hooks/useSalesRealtimeSound.ts`**
   - Assina o canal Realtime do Supabase para `INSERT` na tabela `public.sales`.
   - Toca um som de moeda sintetizado via Web Audio API: dois "tilins" curtos e brilhantes (ex.: 1318 Hz → 1760 Hz, sine + leve decaimento), simulando "titim‑titim".
   - Mostra um `toast.success` tipo: `"Nova venda registrada — R$ X por <vendedor>"` (formatado em BRL).
   - Invalida queries relevantes: `["sales"]`, `["dashboard"]`, `["team-daily-sales"]`, `["commissions"]` para o UI refletir na hora.
   - Usa `lastEventRef` para evitar duplicidade (mesmo padrão do hook existente).

2. **Plugar no `AppLayout`**
   - Em `src/components/layout/AppLayout.tsx`, chamar `useSalesRealtimeSound()` logo abaixo de `useRegistrationsRealtimeSound()`, para que toque em qualquer tela enquanto o usuário estiver logado.

## Detalhes técnicos

- Som: `playCoinChime()` reaproveita a abordagem do `playChime` atual — `AudioContext` + 2 osciladores sine em sequência rápida (~80ms cada) com envelope de ganho exponencial, sem dependência externa.
- Realtime: já está habilitado para `client_registrations`; precisa garantir que `sales` esteja em `supabase_realtime` (publication) e com `REPLICA IDENTITY FULL` se ainda não estiver. Se faltar, rodo a migration:
  ```sql
  ALTER TABLE public.sales REPLICA IDENTITY FULL;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.sales;
  ```
- Regra de notificação: notificar **todos** os usuários (admin, backoffice, vendedores). O próprio autor da venda também ouve — confirma visualmente que registrou.

## Não muda

- Hook de cadastros (continua igual).
- Schema das vendas (só publication/replica se necessário).
- Lógica de salvar venda (`useSaveSale`).

## Pergunta opcional

Quer que o vendedor que **registrou** a venda também escute o som, ou apenas os outros usuários? Por padrão vou deixar **todos ouvindo** (incluindo quem registrou), como feedback positivo — me avisa se preferir excluir o autor.
