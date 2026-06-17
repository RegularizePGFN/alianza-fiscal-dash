## Objetivo
Destravar a integração Chatwoot → `chatwoot-novo-lead` que hoje está 100% em 401, e blindar o filtro de `message_type`.

## Diagnóstico atual (já confirmado nos logs)
- Todas as chamadas recentes do Chatwoot (20:09–20:12 UTC) caíram em **401 unauthorized**. Nenhuma chegou a logar payload, então não dá pra confirmar pelos logs qual seria a branch (`inbox_not_allowed`, `no_cnpj`, etc.) — o request morre antes.
- Sobre `inbox_id`: a função **já aceita** `conversation?.inbox_id ?? payload?.inbox?.id` (linha 94 do `index.ts` atual). Nenhuma mudança necessária aqui.
- Sobre `message_type`: hoje só aceita a string `"incoming"`. Vamos blindar para aceitar também o número `0` (alguns payloads internos do Chatwoot usam enum numérico).

## Passos

### 1. Re-aplicar o secret com o valor exato da URL
Disparar `update_secret` para `CHATWOOT_WEBHOOK_SECRET` com o valor:
```
bab34cdf62faee175131963ce0a3321886f402b5b64b998a3295d5072a59ca25
```
Isso garante que o que está no env bate exatamente com o `?secret=` da URL registrada no Chatwoot. Esse valor vale automaticamente também para o header `x-webhook-secret`, então a `chatwoot-test-connection` continua funcionando.

URL final do webhook (a mesma de antes, só re-confirmada):
```
https://sbxltdbnqixucjoognfj.supabase.co/functions/v1/chatwoot-novo-lead?secret=bab34cdf62faee175131963ce0a3321886f402b5b64b998a3295d5072a59ca25
```

### 2. Blindar `message_type` em `supabase/functions/chatwoot-novo-lead/index.ts`
Trocar:
```ts
if (event !== "message_created" || messageType !== "incoming") {
```
por:
```ts
const isIncoming = messageType === "incoming" || messageType === 0;
if (event !== "message_created" || !isIncoming) {
```

### 3. Adicionar log de diagnóstico no 401 (sem expor o secret)
Antes do `return json(401, ...)`, logar:
- se veio header (`x-webhook-secret` presente sim/não)
- se veio query param (`?secret=` presente sim/não)
- comprimento do valor recebido e os 4 primeiros caracteres (para comparar com `bab3...` sem expor o resto)

Isso permite, na próxima tentativa do Chatwoot, confirmar em segundos se o problema é "nada chegou", "header errado" ou "secret diferente".

### 4. Validar
- Pedir pro usuário disparar uma mensagem de teste no Chatwoot (inbox 99) com um CNPJ válido no corpo.
- Ler os logs de `chatwoot-novo-lead`:
  - Se ainda for 401 → o novo log dirá exatamente o que o Chatwoot está enviando, e ajustamos a URL no Chatwoot.
  - Se passar → veremos a branch real (`inbox_not_allowed`, `no_cnpj`, `created`, etc.) e seguimos a partir dali.

## Fora de escopo
- Mudar a leitura de `inbox_id` (já está correta).
- Mexer em `chatwoot-test-connection`.
- Qualquer alteração de schema ou UI.