## Objetivo

Remover o card grande "Propostas Geradas Hoje" do dashboard e transformá-lo em um **popup (Dialog)** que abre ao clicar no card "Propostas da Equipe Hoje" (visível apenas para admin). Dentro do popup, dividir o conteúdo em **dois cards lado a lado**: uma tabela compacta e um painel de gráficos (forecast).

## O que muda no Dashboard

- Remover a renderização atual de `<TodayProposalsCard />` em `DashboardPage.tsx`.
- Em `daily-results-today/ProposalsCard.tsx`, tornar o card clicável **apenas para admin**:
  - Adicionar `cursor-pointer`, hover state mais forte e um pequeno ícone indicando "ver detalhes".
  - Ao clicar, abrir o novo Dialog `TodayProposalsDialog`.
- Para vendedor (não-admin), o card permanece igual (não clicável).

## Novo popup: `TodayProposalsDialog`

Dialog largo (`max-w-6xl`, altura controlada com scroll interno) contendo:

### Card 1 — Tabela compacta (lado esquerdo, ~60%)
Reaproveita os dados de `useTodayProposals`, com estilo próximo da tabela "Vendedores do Dia":
- Fonte `text-xs`, padding reduzido (`py-1.5 px-2`), `tabular-nums`.
- Colunas (sem percentual de desconto):
  1. Hora (HH:mm)
  2. Vendedor
  3. Cliente / CNPJ (CNPJ em linha menor abaixo)
  4. Valor Original (right-align)
  5. Valor c/ Desc. (right-align)
  6. Honorários (right-align, destaque em primary, sort default desc)
- Cabeçalhos clicáveis para ordenação (mantém lógica atual).
- `ScrollArea` com altura fixa (~`h-[420px]`).
- Rodapé compacto com totalizadores: nº de propostas, total original, total honorários.

### Card 2 — Forecast / Gráficos (lado direito, ~40%)
Foco em ajudar o admin a "cobrar" os vendedores. Conteúdo:
- **Mini-KPIs no topo**: Total de propostas hoje, Soma de honorários, Ticket médio de honorários.
- **Gráfico 1 — Propostas por hora** (BarChart com Recharts): eixo X = hora do dia (agrupado por hora cheia), eixo Y = nº de propostas. Mostra quando a equipe está produzindo.
- **Gráfico 2 — Honorários por vendedor** (BarChart horizontal): vendedor × soma de honorários do dia, ordenado desc. Identifica quem está gerando mais potencial de venda.

### Cabeçalho do Dialog
- Título: "Propostas Geradas Hoje — DD/MM/AAAA".
- Botão **"Exportar Excel"** no canto superior direito que gera um `.xlsx` com todas as propostas do dia (colunas: Data, Hora, Vendedor, Cliente, CNPJ, Valor Original, Valor c/ Desconto, Honorários). Usar `xlsx` (já presente em `excelUtils.ts`/projeto) ou o utilitário existente.

## Arquivos

**Criar**
- `src/components/dashboard/today-proposals/TodayProposalsDialog.tsx` — Dialog com layout em grid 2 colunas.
- `src/components/dashboard/today-proposals/TodayProposalsTable.tsx` — Tabela compacta extraída/refatorada do `TodayProposalsCard.tsx` atual.
- `src/components/dashboard/today-proposals/TodayProposalsCharts.tsx` — Mini-KPIs + dois gráficos Recharts.
- `src/components/dashboard/today-proposals/exportTodayProposals.ts` — Helper para exportar XLSX.

**Editar**
- `src/components/dashboard/daily-results-today/ProposalsCard.tsx` — Receber callback `onClick` (ou estado local) para abrir o dialog quando admin; visual de hover/cursor.
- `src/components/dashboard/daily-results-today/DailyResultsToday.tsx` — Gerenciar o estado de abertura do dialog e renderizá-lo. (Verificar arquivo durante a implementação.)
- `src/pages/DashboardPage.tsx` — Remover `<TodayProposalsCard />` e o import.
- `src/components/dashboard/today-proposals/index.ts` — Exportar novos componentes; remover/depreciar export do card antigo.

**Remover (opcional)**
- `TodayProposalsCard.tsx` antigo pode ser deletado ou mantido apenas como referência. Plano: **deletar** para evitar código morto.

## Detalhes técnicos

- Manter o hook `useTodayProposals` como está (fonte única de dados). O `enabled` continuará `true` quando admin estiver logado e o dialog montado — ou alternar para `enabled` apenas quando o dialog abrir, para economizar fetch (preferir esta abordagem).
- Gráficos usando `recharts` (já no projeto via `chart.tsx`).
- Exportação XLSX com nome `propostas-hoje-YYYY-MM-DD.xlsx`.
- Tabela compacta: `text-xs`, `leading-tight`, células `py-1.5 px-2`, header `sticky top-0 bg-background` dentro do ScrollArea.
- Dialog responsivo: em telas menores, empilhar os dois cards (`grid-cols-1 lg:grid-cols-5` com `lg:col-span-3` / `lg:col-span-2`).
