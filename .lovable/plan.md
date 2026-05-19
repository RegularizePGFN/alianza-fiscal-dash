## Problema

A Priscilla está no banco com `role = 'backoffice'`, mas o sistema não reconhece esse papel em vários lugares:

1. **Mapeamento de role ignora "backoffice"** — `src/contexts/auth/utils.ts` (`mapUserRole`) só reconhece `admin` e `vendedor`; qualquer outro valor cai no default `SALESPERSON`. Por isso ela aparece como "Vendedor" na tabela de Usuários e o sidebar dela mostra o menu de vendedora (Dashboard, Vendas, Propostas, Cadastros, Meu Histórico).
2. **Badge da tabela de Usuários** (`UsersTable.tsx`) não tem variante para Backoffice.
3. **Perfil mostra "Especialista Tributário"** — `src/pages/ProfilePage.tsx` linha 205 e `src/components/users/UserProfileView.tsx` linha 55 retornam essa string fixa para qualquer role que não seja admin.
4. **Menu do backoffice tem itens demais** — `AppSidebar.tsx` (linhas 104-110) já tem um branch específico para backoffice, mas mostra Cadastros, Propostas, Vendas e Dashboard. Precisa ficar só Propostas e Cadastros.
5. **Landing page** — `src/pages/Index.tsx` redireciona todo logado para `/dashboard`. Para backoffice deve ir para `/cadastros`.

## Mudanças

**1. `src/contexts/auth/utils.ts`** — adicionar reconhecimento de `backoffice` no `mapUserRole` retornando `UserRole.BACKOFFICE`.

**2. `src/components/users/UsersTable.tsx`** — adicionar `UserRole.BACKOFFICE` no `roleConfig` com label "Backoffice" e variante distinta (ex.: `secondary`).

**3. `src/components/users/UserProfileView.tsx`** — adicionar case `'backoffice' → 'Backoffice'` em `getRoleLabel`.

**4. `src/pages/ProfilePage.tsx`** (linha ~205) — trocar o ternário fixo por um mapeamento que cubra admin / backoffice / vendedor:
- admin → "Administrador"
- backoffice → "Backoffice"
- vendedor → "Especialista Tributário"

**5. `src/components/layout/AppSidebar.tsx`** (linhas 104-110) — no branch `isBackoffice`, remover Dashboard e Vendas, deixando apenas:
- Cadastros
- Propostas

**6. `src/pages/Index.tsx`** — após login, se `role === BACKOFFICE`, redirecionar para `/cadastros`; caso contrário, manter `/dashboard`.

## Observações

- Não vou criar route guard server-side neste momento (escopo pedido é apenas esconder do menu). Se quiser bloquear acesso direto via URL depois, é só avisar.
- Nenhuma migração de banco necessária — `role = 'backoffice'` da Priscilla já está correto.
- O hook `useUsers` já lê o campo `role` do profile e passa para `mapUserRole`; depois do fix do passo 1, ela aparecerá automaticamente como Backoffice em todos os lugares.
