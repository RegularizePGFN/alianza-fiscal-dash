## Plano: Ordenação por Última Atualização na Listagem de Cadastros

### Objetivo
Alterar o critério de ordenação da listagem de cadastros para que registros recentemente atualizados (nova observação, mudança de status, edição) subam automaticamente para o topo da lista, como um alerta para a equipe.

### Onde alterar
- `src/hooks/useRegistrations.ts`

### Mudança técnica
- Trocar `.order("created_at", { ascending: false })` para `.order("updated_at", { ascending: false })` na query que busca os registros do Supabase.

### Comportamento esperado
- Cadastros antigos que receberem qualquer atualização (observação, status, dados corrigidos) serão exibidos primeiro na listagem.
- O filtro de período (`from`/`to`) continuará baseado em `created_at` para não alterar o escopo de resultados — apenas a ordenação dentro do período selecionado mudará.

### Nota
A coluna `updated_at` já existe na tabela `client_registrations` e é atualizada automaticamente pelo trigger `updated_at` do Supabase.