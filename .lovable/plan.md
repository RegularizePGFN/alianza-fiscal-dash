# Redesign do Histórico de Propostas (aba Propostas) + clique direto para o PDF

Vamos reconstruir a aba **Histórico de Propostas** inspirando-se no card "Propostas Geradas" do Dashboard (rápido, com paginação real no banco, filtros enxutos, visual mais limpo) e tornar o clique em qualquer proposta uma ação que **abre direto o PDF** (sem precisar passar pelo botão "Gerar proposta").

## 1. Escopo de visibilidade

- **Vendedor**: vê apenas as próprias propostas (KPIs, gráficos, tabela, todos filtrados por `user_id`).
- **Admin**: vê tudo, e ganha o filtro de "Vendedor" (igual ao do dashboard).
- A filtragem acontece já na query do Supabase (não no cliente), respeitando RLS.

## 2. Novo layout da aba (substitui `HistoryTabContent.tsx`)

```text
┌─────────────────────────────────────────────────────────────┐
│ Histórico de propostas              [Período ▾] [Atualizar] │
│ Vendedor: filtro só para admin                              │
├─────────────────────────────────────────────────────────────┤
│ KPIs enxutos (4 cards, não 6):                              │
│  • Propostas no período   • Valor consolidado               │
│  • Honorários totais      • Desconto médio                  │
├─────────────────────────────────────────────────────────────┤
│ 2 colunas (igual dashboard):                                │
│  [Gráfico: Propostas por dia]   [Gráfico: Por vendedor*]    │
│  *só para admin; vendedor vê "Por status/desconto"          │
├─────────────────────────────────────────────────────────────┤
│ Tabela leve com clique-para-abrir PDF, paginação no server  │
│ Colunas: Data · Cliente · CNPJ · Valor · Desconto · Honor. │
│ Hover destaca a linha; linha inteira clicável → abre PDF    │
└─────────────────────────────────────────────────────────────┘
```

- Remove os cards repetidos ("Total" + "Hoje" + "Valor com Reduções") — fica só o que importa no período selecionado.
- Skeletons enquanto carrega (não bloqueia a tela inteira).
- Estado vazio amigável ("Nenhuma proposta no período").

## 3. Performance — fim do "demora muito para carregar"

Hoje a aba puxa tudo via `useFetchProposalsWithFilter` e processa no cliente. Vamos seguir o padrão do dashboard:

- Nova hook `useProposalsHistory({ from, to, sellerId, page, pageSize })` baseada em `useTodayProposals.ts`:
  - SELECT só das colunas usadas na tabela/KPI (sem `proposal_data` pesado).
  - Paginação real (`.range(offset, offset+size-1)`) + `count: 'exact'`.
  - `staleTime: 30s`, `refetchInterval: 60s`.
  - Filtro `user_id` aplicado quando não‑admin.
- KPIs e gráficos calculados a partir de um **RPC agregador** (`get_proposals_history_summary`) com `SECURITY DEFINER`, que devolve em uma única chamada: total, soma consolidada, soma honorários, desconto médio, série diária e (se admin) top vendedores. Mesmo padrão dos outros RPCs do projeto.
- Cache `react-query` por chave `[period, sellerId, role]`.

## 4. Clique-para-abrir PDF (correção de UX)

Hoje `handleViewProposal` carrega a proposta e leva a pessoa para a aba "Proposta", mas o PDF não aparece até clicar de novo em "Gerar proposta". Vamos consertar:

- Nova action `openProposalPreview(proposal)`:
  1. `setSelectedProposal(proposal)` + hidrata `formData` com os dados salvos.
  2. `setGeneratedProposal(true)` (já existia, mas sem o passo abaixo não bastava).
  3. **Não passa mais pela aba de geração**: abre um **Dialog (modal) de visualização** com o `ProposalPreviewLayout` já renderizado e o botão "Baixar PDF" no rodapé.
- Disparado tanto pelo ícone 👁 quanto pelo clique na linha inteira.
- O modal aproveita o `ResponsivePdfPreview` que já criamos, garantindo que o PDF caiba em qualquer zoom.
- Mantém o template salvo na proposta (`templateId`) para abrir Modelo 1 ou Modelo 2 corretamente.

## Detalhes técnicos

**Arquivos a editar:**
- `src/pages/proposals/components/HistoryTabContent.tsx` — novo layout (KPIs + 2 gráficos + tabela).
- `src/components/proposals/ProposalsSummaryCards.tsx` — enxugar para 4 KPIs derivados dos dados do período (ou substituir por componente novo `ProposalsHistoryKpis`).
- `src/components/proposals/ProposalHistory.tsx` — virar tabela leve com linha clicável; remove `proposal.data.*` pesado do render.
- `src/components/proposals/dashboard/ProposalsDashboard.tsx` — passar a usar o RPC agregador; respeitar role.
- `src/hooks/proposals/useProposalsStateWithFilter.tsx` — separar a query "lista paginada" da query "agregados"; aplicar `user_id` quando não‑admin.
- `src/hooks/proposals/useProposalHandlers.tsx` + `useProposalGeneration.tsx` — adicionar `openProposalPreview` (modal) sem mexer no fluxo de geração.
- Novo: `src/components/proposals/ProposalPreviewDialog.tsx` — modal que envolve `ProposalPreviewLayout` + botão de download.

**Arquivos novos (backend):**
- Migração SQL: função `get_proposals_history_summary(_from timestamptz, _to timestamptz, _user_id uuid default null)` `SECURITY DEFINER` retornando `jsonb` com `kpis`, `daily_series`, `by_seller`. Concede `EXECUTE` para `authenticated`.

**Fora do escopo (não mexer agora):**
- Geração do PDF em si (Modelo 1 / Modelo 2 já estão bons).
- Aba "Gerar proposta" (passos 1-3) e o stepper.
- Permissões/RLS da tabela `proposals` (mantemos as atuais; o filtro por `user_id` no client é apenas otimização — RLS continua sendo a verdade).
- Exportação Excel (pode ficar para depois se você quiser).

## Pergunta rápida antes de implementar

1. Quando você clicar numa proposta no histórico, prefere que ela abra num **modal sobre a aba atual** (sem perder o filtro/posição) **ou** que troque para a aba "Gerar proposta" já no Passo 3 mostrando o PDF? Recomendo o **modal**, mas confirma para eu seguir.
2. Pode remover os cards "Total de propostas" e "Propostas Hoje" do histórico (eles já existem no Dashboard) e deixar só os 4 KPIs do período? Ou você quer manter os 6?
