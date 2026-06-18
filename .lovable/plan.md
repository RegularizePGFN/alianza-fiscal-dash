## Item 1 — chatwoot_conversation_id no cadastro

Boa notícia: **já está implementado**. A tabela `client_registrations` tem a coluna `conversation_id` (bigint) e o `chatwoot-novo-lead` já grava o `conversation.id` do payload nela ao criar o cadastro. Não precisa de migração nem mudança aqui.

(Se preferir renomear para `chatwoot_conversation_id` por clareza, podemos fazer — mas vai exigir migração + atualização de código em vários pontos. Recomendo manter como está.)

## Item 2 — Enviar PDF como nota privada no Chatwoot ao concluir automação

Alterar apenas `supabase/functions/automation-result/index.ts` no ramo `status === "success"`:

1. Ao buscar o registro, incluir `conversation_id` no `select`.
2. Manter o fluxo atual: decodificar base64 → upload para o bucket `cadastro-automatico-pdfs` → inserir em `client_registration_automation_files` → atualizar registro para `realizado`.
3. **Novo passo (após salvar tudo com sucesso):** se `conversation_id` não for nulo e houver arquivos, para cada arquivo enviar para o Chatwoot:
   - Endpoint: `POST https://chatwoot.neumocrm.com.br/api/v1/accounts/1/conversations/{conversation_id}/messages`
   - Headers: `api_access_token: <CHATWOOT_API_TOKEN>` (sem `Content-Type` — o `fetch` define o boundary do multipart)
   - Body: `FormData` com:
     - `content`: `"Relatório de dívidas gerado com sucesso. Segue em anexo."` (enviado apenas no primeiro arquivo; nos demais, content vazio para não duplicar a mensagem)
     - `private`: `"true"`
     - `attachments[]`: `new File([bytes], fileName, { type: "application/pdf" })`
4. Tratamento de erro do envio ao Chatwoot:
   - **Não falhar a request da automação** se o Chatwoot retornar erro — o cadastro já foi salvo. Apenas logar (`console.error`) e seguir.
   - Incluir contagem `chatwoot_notes_sent` na resposta JSON para debug.
5. Usar as mesmas constantes do `chatwoot-list-inboxes`:
   - `CHATWOOT_BASE_URL = "https://chatwoot.neumocrm.com.br"`
   - `CHATWOOT_ACCOUNT_ID = 1`
   - Token via `Deno.env.get("CHATWOOT_API_TOKEN")` (já configurado nos secrets).

### Observações técnicas

- A função usa autenticação `x-api-key` própria (não JWT), então não precisa mexer em config.toml.
- Se `CHATWOOT_API_TOKEN` não estiver setado, pular o envio com warning (não quebrar a automação).
- Não há mudança de banco, nem de RLS, nem de frontend.

### Arquivos alterados

- `supabase/functions/automation-result/index.ts` (única alteração)
