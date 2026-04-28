## Plano: Card "Propostas Geradas Hoje" (Admin Dashboard)

### Objetivo
Adicionar um novo card no Dashboard, visível **apenas para admins**, listando todas as propostas criadas hoje pela equipe, com colunas detalhadas e ordenação por coluna (com foco em honorários do maior para o menor por padrão).

### Posicionamento
Inserido em `DashboardPage.tsx`, **logo abaixo** do componente `<DailyResultsToday />` (que mostra os 3 KPIs: Propostas da Equipe Hoje, Simulações Hoje, Comissões da Equipe Hoje), em formato horizontal (full-width).

### Layout do card

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Propostas Geradas Hoje                              [28/04/2026] [N propostas] │
├──────────────────────────────────────────────────────────────────────────────┤
│ Vendedor │ Cliente / CNPJ │ Valor Original │ Valor c/ Desc. │ Desc. % │ Honorários ▼ │ Hora │
│ Lucas    │ Empresa X      │ R$ 100.000,00  │ R$ 60.000,00   │ 40%     │ R$ 8.000,00  │ 14:32│
│ Ana      │ Empresa Y      │ R$  80.000,00  │ R$ 50.000,00   │ 37%     │ R$ 6.000,00  │ 11:05│
│ ...                                                                          │
└──────────────────────────────────────────────────────────────────────────────┘
```

Colunas:
- **Vendedor** (nome do criador da proposta, via join com `profiles`)
- **Cliente / CNPJ** (`client_name` + `cnpj` em duas linhas)
- **Valor Original** (`total_debt`) — alinhado à direita
- **Valor c/ Desconto** (`discounted_value`) — alinhado à direita
- **Desconto %** (`discount_percentage`)
- **Honorários** (`fees_value`) — alinhado à direita, **destacado** (cor primária / negrito), ordenação padrão desc
- **Hora** (HH:mm de `created_at`, com tooltip mostrando data completa)

Cabeçalhos clicáveis para alternar ordenação (asc/desc) — padrão: Honorários desc.

Rodapé do card com totalizadores: total de propostas, soma de honorários, soma de valor original.

### Componentes a criar

| Arquivo | Função |
|---------|--------|
| `src/components/dashboard/today-proposals/TodayProposalsCard.tsx` | Card principal com tabela, ordenação e totalizadores |
| `src/components/dashboard/today-proposals/useTodayProposals.ts` | Hook que busca propostas do dia (admin) com nomes dos vendedores |
| `src/components/dashboard/today-proposals/index.ts` | Re-export |

### Hook `useTodayProposals`
- Usa `@tanstack/react-query` (`queryKey: ['today-proposals-admin']`)
- Query: `proposals` com `created_at >= today 00:00` e `< amanhã 00:00` (timezone America/Sao_Paulo, alinhado com a memória do projeto)
- Faz lookup em `profiles` para obter `name` por `user_id` (mesmo padrão de `useFetchProposals`)
- `staleTime: 30s`, `refetchInterval: 60s` (consistente com `TodayDataContext`)
- Retorna `{ proposals, isLoading }`

### Integração em `DashboardPage.tsx`
```tsx
<DailyResultsToday />

{isAdmin && <TodayProposalsCard />}   // novo

<GoalsCommissionsSection ... />
```

### Estados
- **Loading**: skeleton de tabela (3-5 linhas)
- **Vazio**: mensagem "Nenhuma proposta gerada hoje ainda"
- **Erro**: toast + mensagem inline

### Estilo
Segue padrão SaaS premium do projeto (memória `mem://ui/design-system-standards`): valores monetários alinhados à direita, formatação BRL, dark-mode compatível, uso de componentes `Card`, `Table` e `Badge` do shadcn.

### Detalhes técnicos
- Filtro de data calculado client-side (início/fim do dia local) e enviado em ISO para o Supabase
- RLS já permite admin ver todas as propostas (política "Admins podem ver todas as propostas") — sem mudanças no banco
- Ordenação feita client-side (volume baixo: propostas de um único dia)

### Resultado esperado
Admins veem, abaixo dos 3 KPIs do dia, um card horizontal com a lista completa das propostas geradas hoje pela equipe, ordenável por qualquer coluna (padrão: honorários desc), permitindo identificar rapidamente quem gerou as propostas mais valiosas do dia.
