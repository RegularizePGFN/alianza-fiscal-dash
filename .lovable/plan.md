
# Inteligência Comercial — nova tela de análise profunda

Menu lateral em **Comercial** (apenas admins), rota `/inteligencia-comercial`. Foco em responder as perguntas que hoje o sistema não responde, cruzando `proposals` × `sales` via CNPJ.

## Diagnóstico do que já existe

- **Dashboard**: KPIs do dia, ranking, vendas por vendedor, propostas geradas hoje.
- **Relatórios**: volume por período, por método de pagamento, top vendedores, comissões.
- **Propostas**: histórico bruto e cards de resumo.
- **O que não existe** (lacuna que essa tela vai preencher):
  - Funil real **proposta → venda** (taxa de conversão por vendedor).
  - Tempo médio entre criar proposta e fechar venda (mesmo CNPJ).
  - Distribuição "vendeu no mesmo dia × dias depois".
  - Heatmap de horário/dia da semana de geração de proposta e de fechamento.
  - Análise de eficiência: quantas propostas o vendedor precisa criar para fechar 1 venda; valor médio de proposta vs valor médio fechado.
  - Propostas em aberto ("quentes" — sem venda ainda) com aging.

## Validação técnica (já confirmado no banco)

- `sales.client_document` e `proposals.cnpj` permitem cruzamento. **3.206 vendas / 9.286 propostas / 984 matches** hoje (~31%). Documento vem com pontuação variável → normalizar com `regexp_replace('\D','','g')` antes do join.
- Match será feito por **CNPJ normalizado + mesmo vendedor** (`sales.salesperson_id = proposals.user_id`) para evitar atribuir venda de outro vendedor à proposta.
- Quando há mais de uma proposta para o mesmo CNPJ antes da venda, considerar a **proposta mais recente anterior à venda** como a "convertida".

## Estrutura da tela

Layout em abas para não poluir, todas filtradas por **período** (mês atual padrão) e **vendedor** (todos / específico).

```text
┌─ Filtros: período • vendedor • método de pagamento ──────────────┐
├─ KPIs topo ──────────────────────────────────────────────────────┤
│  Propostas criadas │ Vendas fechadas │ Taxa conversão │ Tempo    │
│  no período        │ no período      │ (CNPJ match)   │ médio    │
├─ Abas ───────────────────────────────────────────────────────────┤
│ [Funil] [Tempo de Conversão] [Padrões] [Vendedores] [Em Aberto]  │
└──────────────────────────────────────────────────────────────────┘
```

### Aba 1 — Funil Proposta → Venda
- Gráfico de funil: Propostas criadas → Propostas com venda → Valor proposto → Valor fechado.
- Card "Eficiência da negociação": valor médio fechado / valor médio proposto (mostra desconto real praticado).

### Aba 2 — Tempo de Conversão
- **Distribuição** (gráfico de barras): vendas fechadas em `0 dias` (mesmo dia) / `1 dia` / `2-3` / `4-7` / `8-15` / `16-30` / `>30`.
- KPIs: tempo médio, mediana, p90.
- Tabela com vendas convertidas mostrando: vendedor, cliente, CNPJ, data proposta, data venda, dias decorridos, valor proposto, valor vendido, % desconto realizado.

### Aba 3 — Padrões (horário / dia da semana)
- **Heatmap** dia da semana × hora — duas visões selecionáveis: criação de propostas e fechamento de vendas.
- Gráfico de barras: vendas por hora do dia, vendas por dia da semana.
- Insight automático: "Seu time fecha 62% das vendas entre 14h-17h" (texto gerado a partir dos dados).

### Aba 4 — Análise por Vendedor
Tabela rica e ordenável, uma linha por vendedor:

| Vendedor | Propostas | Vendas | Conv. % | Tempo médio | Ticket prop. | Ticket venda | Desc. médio | Valor total |
|----------|-----------|--------|---------|-------------|--------------|--------------|-------------|-------------|

- Coluna "Perfil" classifica: **Caçador** (alta conversão mesmo dia), **Cultivador** (converte em dias), **Volume** (muitas propostas, conversão baixa), **Atenção** (poucas propostas, sem vendas).
- Mini gráfico inline por vendedor mostrando distribuição de tempo de conversão.

### Aba 5 — Propostas em Aberto (oportunidades quentes)
- Lista propostas **sem venda correspondente ainda**, ordenadas por aging.
- Filtros: aging (0-3d / 4-7d / 8-15d / >15d), valor, vendedor.
- Coluna de ação: link para WhatsApp do cliente (tel já existe em `proposals.client_phone`).
- Destaque visual para propostas com >7 dias e alto valor — são as que o gestor precisa cobrar.

## Implementação técnica

### Backend (RPC SECURITY DEFINER)
Seguindo o padrão do projeto (memória `reporting-aggregation-rpc`), criar funções no Postgres para evitar limite de 1000 linhas e processar o cruzamento server-side:

1. **`get_proposal_to_sale_conversion(p_start date, p_end date, p_user_id uuid default null)`** — retorna por venda no período: salesperson_id, salesperson_name, cnpj, sale_id, sale_date, sale_amount, matched_proposal_id, proposal_created_at, days_to_convert, proposal_value, fees_value. Faz `LEFT JOIN LATERAL` na proposta mais recente do mesmo CNPJ + mesmo vendedor com `created_at <= sale_date`.

2. **`get_commercial_intel_summary(p_start, p_end, p_user_id)`** — KPIs agregados (total propostas, total vendas, taxa conversão, tempo médio/mediana, ticket médio).

3. **`get_open_proposals(p_start, p_end, p_user_id)`** — propostas sem venda correspondente, com aging em dias.

4. **`get_hourly_patterns(p_start, p_end, p_user_id)`** — agregação por `EXTRACT(dow)` × `EXTRACT(hour)` para propostas e vendas (timezone America/Sao_Paulo, conforme memória do projeto).

Apenas admins podem chamar — checagem via `get_current_user_role() = 'admin'` dentro da função.

### Frontend
- Rota: `/inteligencia-comercial` em `src/App.tsx`.
- Página: `src/pages/CommercialIntelPage.tsx`.
- Componentes em `src/components/commercial-intel/`:
  - `CommercialIntelContainer.tsx` (filtros + abas)
  - `IntelKpiCards.tsx`
  - `tabs/ConversionFunnelTab.tsx`
  - `tabs/ConversionTimeTab.tsx`
  - `tabs/PatternsTab.tsx` (heatmap usando `recharts` ou grid Tailwind)
  - `tabs/SalespersonAnalysisTab.tsx`
  - `tabs/OpenProposalsTab.tsx`
- Hooks: `useCommercialIntel.ts` (React Query, `staleTime: 60_000`).
- Sidebar (`src/components/layout/AppSidebar.tsx`): adicionar item **"Inteligência Comercial"** dentro do grupo **Comercial**, com ícone `Brain` ou `LineChart` do lucide-react, condicionado a `isAdmin`.

### Padrões visuais
- Reaproveitar Card/Tabs/Table do shadcn já em uso.
- Skeleton loaders e count-up nos KPIs (memória `design-system-standards`).
- Valores monetários alinhados à direita.
- Tema dark premium consistente com o resto.

## Por que isso é útil

- **Para você (dono)**: vê quem realmente converte, não só quem vende muito; identifica vendedores que geram propostas sem fechar; mede desconto real praticado.
- **Para gestores**: lista de oportunidades quentes (Aba 5) vira ferramenta diária de cobrança; padrões de horário ajudam a planejar escala.
- **Para o vendedor (futuro)**: base para metas de conversão, não só de volume.

## Fora de escopo desta entrega

- Edição/CRUD nesta tela (é só leitura/análise).
- Exportação Excel/PDF — pode ser próximo passo se quiser.
- Visão para vendedor (só admin nesta primeira versão, conforme pedido).
