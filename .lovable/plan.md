# Correção manual do nome da mãe no erro de automação

## Mudanças

### 1. `src/hooks/useAutomation.ts`
Alterar `useAutomationRetry` para aceitar `{ registration_id: string; mother_name?: string }`:
- Se `mother_name` vier preenchido (após `.trim()`), incluir `mother_name: mother_name.trim().toUpperCase()` no `update` junto com o reset de status.
- Toast: `"Nome da mãe atualizado — cadastro recolocado na fila"` quando há correção, senão mantém `"Reenviado para a automação"`.

### 2. `src/components/registrations/AutomationStatusBadge.tsx`
No bloco `status === "error"`:
- Novo estado `correctedMotherName` (string).
- Quando `getMotherNameError(registration)` retornar truthy, renderizar abaixo da caixa vermelha:
  - `Label`: "Nome da mãe correto (opcional)"
  - `Input` controlado, `placeholder="Ex: MARIA APARECIDA SOUZA"`, `onChange` aplica `.toUpperCase()`.
  - Texto auxiliar `text-xs text-muted-foreground`: "Deixe em branco para tentar novamente sem alteração."
- Botão "Tentar novamente" passa a chamar:
  ```ts
  retry.mutateAsync({
    registration_id: registration.id,
    mother_name: correctedMotherName.trim() || undefined,
  })
  ```
- Resetar `correctedMotherName` ao fechar o dialog.
- Se `registration.automation_error` contiver "nome da mãe corrigido", exibir ícone `Pencil` ao lado do label do badge.

### 3. Outros consumidores
Hoje apenas `AutomationStatusBadge` usa `useAutomationRetry` — ajustado na mudança 2. Sem outras alterações.

## Validação
- Cadastro com "NOME DA MAE ERRADO" → input visível, MAIÚSCULAS automáticas, texto auxiliar.
- Retry vazio → status volta para "Na fila" (comportamento atual).
- Retry com nome digitado → `mother_name` atualizado, status "Na fila", toast correto.
- Cadastros com outros erros → input NÃO aparece.
