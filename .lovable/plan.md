## Objetivo
Substituir o cadastro manual de caixas Chatwoot por uma lista carregada direto da API do Chatwoot, com toggles "Ativa" que gravam em `chatbot_inboxes`. A função `chatwoot-novo-lead` não é alterada.

## Backend

### Secret novo
- `CHATWOOT_API_TOKEN` — adicionado via prompt seguro (você fornece o valor).

### Nova edge function `chatwoot-list-inboxes`
- `verify_jwt = true` em `supabase/config.toml` (mesmo padrão de `chatwoot-test-connection`: valida sessão via `auth.getUser()` + checa `role IN ('admin','backoffice')` em `profiles`).
- Chama `GET https://chatwoot.neumocrm.com.br/api/v1/accounts/1/inboxes` com header `api_access_token: <CHATWOOT_API_TOKEN>` (token nunca trafega para o frontend).
- Retorna `{ inboxes: [{ id, name, channel_type, phone_number }] }`.
- Em erro de upstream, devolve `{ error, status }` com o status do Chatwoot para a UI mostrar mensagem clara (ex: 401 do Chatwoot → "Token do Chatwoot inválido").

### `chatwoot-novo-lead`
- Sem mudanças. Continua lendo `chatbot_inboxes` com falha fechada.

## Frontend — `ChatwootInboxManager.tsx` (refatorado)

Comportamento:
- Ao montar, dispara duas queries em paralelo:
  1. `chatbot_inboxes` (estado atual: id + active) — fonte da verdade local.
  2. `chatwoot-list-inboxes` via `supabase.functions.invoke` — lista oficial.
- Renderiza uma linha por inbox vinda do Chatwoot, com o toggle marcado se existir em `chatbot_inboxes` com `active = true`.
- Toggle ON → `upsert` em `chatbot_inboxes` `{ inbox_id, name, active: true }` (onConflict `inbox_id`).
- Toggle OFF → `update active = false` (não deleta, preserva histórico).
- Botão discreto "Atualizar caixas" (ícone `RefreshCw` + label pequeno) no canto direito do header da seção → refetch da função. O estado ativo é preservado porque a fonte é a tabela.
- Remove inteiramente os campos manuais (ID, Nome, botão Adicionar) e o botão de remover por linha.
- Contador no topo: `X de Y caixas ativas` em `text-xs text-muted-foreground`.

Visual (tokens semânticos, sem cor hardcoded):
- Linha ativa: `border-primary/40 bg-primary/5`; inativa: `border-border bg-card/40`.
- Selo "Oficial" nas caixas com `channel_type === 'Channel::WhatsappCloud'` ou `'Channel::Whatsapp'`: `Badge variant="secondary"` pequeno com ícone `BadgeCheck`. Demais canais (ex.: WAHA / API) recebem badge `outline` discreto com o `channel_type` resumido (ex.: "API").
- Mantém título "Caixas de entrada ativas" e subtítulo "apenas caixas marcadas processam o cadastro automático".
- Skeleton enquanto carrega; estado de erro com mensagem do upstream e botão "Tentar novamente".

## Detalhes técnicos
- `supabase/config.toml`: adicionar bloco `[functions.chatwoot-list-inboxes] verify_jwt = true`.
- Frontend chama com `supabase.functions.invoke("chatwoot-list-inboxes")` — token de sessão vai automático.
- `upsert` em `chatbot_inboxes` usa `onConflict: 'inbox_id'` para suportar caixas que nunca existiram localmente.
- `channel_type` e `phone_number` são apenas para exibição; não persistimos (mantém schema atual).

## Validação
1. Abrir o card → ver lista completa (2 META + WAHAs).
2. Toggle ON na 99 → confirmar linha em `chatbot_inboxes` com `active=true`.
3. "Atualizar caixas" → lista refresca; toggles preservados.
4. Disparar lead real na 99 → `chatwoot-novo-lead` continua processando normal.
