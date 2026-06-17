## Objetivo

Adicionar um card "Conexão Chatwoot" no topo de `RegistrationsContainer`, que (a) mostra passivamente se o fluxo está vivo e (b) permite disparar um teste end-to-end da função `chatwoot-novo-lead` com o secret real, sem sujar as métricas.

## 1. Nova edge function `chatwoot-test-connection`

Por que: o frontend não pode ter o `CHATWOOT_WEBHOOK_SECRET`. Esta função roda no backend, chama a `chatwoot-novo-lead` real com o header verdadeiro, e reporta o resultado em camadas. Não altera a `chatwoot-novo-lead`.

Comportamento (POST, exige usuário autenticado admin/backoffice):

1. **Camada Autenticação** — faz um POST para a URL pública de `chatwoot-novo-lead` com `X-Webhook-Secret = CHATWOOT_WEBHOOK_SECRET` e um payload mínimo válido. Se vier 401 → reporta `auth: false` com a mensagem e para. Se vier 2xx → `auth: true`.
2. **Payload de teste fixo**: `event: "message_created"`, `message_type: "incoming"`, `conversation.id: 0`, `sender` com nome/telefone "Teste Conexão" / "+5500000000000", e `content` contendo um CNPJ de teste válido (dígito verificador correto, ex. `45.997.418/0001-53` — Nubank, válido).
3. **Camada Extração** — analisa a resposta:
   - `{ ok: true, ignorado: true }` → CNPJ não foi extraído → `extraction: false`.
   - `{ ok: true, cadastro_id: ... }` → `extraction: true`.
4. **Camada Gravação** — com o `cadastro_id` retornado, faz `SELECT` em `client_registrations` (service role) para confirmar que a linha existe → `persistence: true/false`.
5. **Limpeza obrigatória** — imediatamente após verificar, faz `DELETE` da linha criada por `cadastro_id` (e por garantia, `DELETE WHERE conversation_id = 0`). Isso:
   - mantém o teste fora das métricas;
   - libera o `conversation_id = 0` para o próximo teste, contornando a idempotência sem alterar a função original.
6. Retorna JSON:
   ```json
   {
     "tested_at": "2026-06-17T...",
     "auth": { "ok": true, "status": 200, "message": "" },
     "extraction": { "ok": true, "cnpj_detected": "45997418000153" },
     "persistence": { "ok": true, "cadastro_id": "uuid" },
     "overall": "ok" | "fail",
     "raw_response": { ... }
   }
   ```

Config: adicionar `[functions.chatwoot-test-connection]` em `supabase/config.toml` com `verify_jwt = true` (só admin/backoffice loga e dispara). Dentro da função, validar `role IN ('admin','backoffice')` via `auth.getClaims` + profiles.

## 2. Hook `useChatwootHealth`

Arquivo novo `src/hooks/useChatwootHealth.ts`. Duas queries via React Query:

- `last-chatbot-lead`: `SELECT created_at FROM client_registrations WHERE source = 'chatbot' ORDER BY created_at DESC LIMIT 1`.
- `today-chatbot-count`: `SELECT count FROM client_registrations WHERE source = 'chatbot' AND created_at >= start_of_today`.

`staleTime: 60s`, `refetchInterval: 60s` (refresh leve para o card ficar vivo).

E um `useMutation` `useTestChatwootConnection` que invoca a edge function `chatwoot-test-connection` via `supabase.functions.invoke`.

## 3. Componente `ChatwootConnectionCard`

Arquivo novo `src/components/registrations/ChatwootConnectionCard.tsx`. Renderizado no topo de `RegistrationsContainer`, acima do `RegistrationsKpiCards`.

Layout (uma linha em desktop, empilha em mobile):

```text
┌─ Conexão Chatwoot ────────────────────────────────────────────────┐
│ ● Último lead via chatbot: há 23 min   |   Hoje: 12 leads          │
│ [Testar conexão]   última verificação: 16:42  ✓ Auth ✓ CNPJ ✓ DB  │
└────────────────────────────────────────────────────────────────────┘
```

Regras visuais (usar tokens semânticos, não cores hardcoded):

- Bolinha de status passivo baseado no "último lead via chatbot":
  - `< 6h` → verde (success token);
  - `6h–24h` → amarelo (warning token);
  - `> 24h` ou nunca → vermelho (destructive token).
- Texto "há X" formatado com `formatDistanceToNow` (pt-BR).
- Botão "Testar conexão": dispara mutation, mostra spinner enquanto roda.
- Resultado do teste: três chips em linha (`Autenticação`, `Extração`, `Gravação`) com `✓` verde ou `✗` vermelho. Se ✗, mostrar a mensagem curta abaixo do chip que falhou.
- Data/hora do último teste (estado local, não precisa persistir).
- Botão "Ver detalhes" (collapsible) que mostra o JSON `raw_response` em `<pre>` para depuração — útil quando o usuário precisar mandar print.

## 4. Integração em `RegistrationsContainer`

Inserir `<ChatwootConnectionCard />` logo após o `<div>` do título (linhas ~139), antes de `<RegistrationsKpiCards />`. Sem mudar tabs nem filtros existentes.

## 5. Garantias de não-poluição

- A função apaga o cadastro de teste antes de retornar. Mesmo se a chamada de DELETE falhar, o filtro de métricas atual usa `source = 'chatbot'` ou está sem filtro de source — para reforçar, o card lê chatbot leads filtrando explicitamente `source = 'chatbot'`, então registros com `source = 'manual'` ou (no caso extremo de não conseguir deletar) `source = 'chatbot'` mas com `conversation_id = 0` não distorcem a métrica de "Último lead" porque verificamos o id 0.
- KPIs gerais (`RegistrationsKpiCards`) já operam sobre `items` carregados por período, e o teste é deletado em milissegundos. Risco residual: nulo na prática.

## Detalhes técnicos

- Edge function usa `fetch` direto para `${SUPABASE_URL}/functions/v1/chatwoot-novo-lead` com headers `apikey: ANON_KEY`, `Authorization: Bearer ANON_KEY`, `X-Webhook-Secret: <secret>`, `Content-Type: application/json`. (A `chatwoot-novo-lead` está com `verify_jwt = false`, então basta `apikey`.)
- `DELETE` do cadastro usa `SUPABASE_SERVICE_ROLE_KEY` via cliente supabase no edge runtime.
- Validação de papel: `getClaims` → `profiles.role IN ('admin','backoffice')`, senão 403.
- CNPJ de teste: `45.997.418/0001-53` (Nubank) — válido nos dígitos verificadores, garante que a camada de extração reflita o caminho real.

## Arquivos

Novos:
- `supabase/functions/chatwoot-test-connection/index.ts`
- `src/hooks/useChatwootHealth.ts`
- `src/components/registrations/ChatwootConnectionCard.tsx`

Editados:
- `supabase/config.toml` (registrar a nova função)
- `src/components/registrations/RegistrationsContainer.tsx` (montar o card no topo)

Fora de escopo: nenhuma alteração em `chatwoot-novo-lead`, no schema da tabela, ou nas métricas existentes.
