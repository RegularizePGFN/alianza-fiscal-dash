## Problema

A função `chatwoot-novo-lead` insere em `client_registrations` sem usuário autenticado. O trigger `handle_registration_insert` tenta gravar em `client_registration_events` com `changed_by = auth.uid()` (NULL) — e a coluna tem `NOT NULL`, derrubando o insert.

## Decisão

Não existe hoje um "usuário sistema" real em `auth.users`, e criar um só para isso adiciona complexidade (linha em `auth.users`, em `profiles`, manutenção). Vou pela **opção 1 com auditoria preservada via texto**:

- Permitir `changed_by` NULL em `client_registration_events`.
- Quando NULL, preencher `changed_by_name` com um rótulo legível (`'Chatbot'` quando `source = 'chatbot'`, senão `'Sistema'`). Assim a auditoria continua completa visualmente — só não há FK para um usuário real, o que é honesto (não foi um usuário).

## Mudanças

**1. Migration**
- `ALTER TABLE public.client_registration_events ALTER COLUMN changed_by DROP NOT NULL;`
- Atualizar `handle_registration_insert()`:
  - Se `auth.uid()` for NULL, definir `v_user_name` como `'Chatbot'` se `NEW.source = 'chatbot'`, senão `'Sistema'`.
  - Inserir o evento com `changed_by = auth.uid()` (pode ser NULL) e `changed_by_name = v_user_name`.
- Mesmo tratamento em `handle_registration_status_change()` para consistência futura (atualizações automáticas também ficam auditadas).

**2. Sem mudanças** em `chatwoot-novo-lead/index.ts` nem na UI — o trigger passa a tolerar inserts sem autor.

## Validação

Após a migration ser aprovada e aplicada, rodar "Testar conexão" no card de Cadastros e confirmar as 3 camadas verdes (Auth ✓ / Extração ✓ / Gravação ✓).

## Fora de escopo

Criar usuário sistema real em `auth.users`, mudar o fluxo do `automation-result`, ou alterar a UI do card.