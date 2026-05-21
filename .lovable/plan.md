
# API de cadastro automático

Integração via **pull**: o sistema externo consulta a fila de cadastros pendentes, executa o cadastro e devolve o resultado (sucesso + PDFs, ou erro + descrição). Tudo autenticado por **API Key fixa**.

## 1. Banco — colunas e bucket novos

Adicionar em `client_registrations`:

- `automation_status` text — `pending` | `processing` | `success` | `error` (default `pending`)
- `automation_started_at` timestamptz
- `automation_finished_at` timestamptz
- `automation_error` text — descrição do erro devolvido pelo externo
- `automation_attempts` int default 0

Bucket novo `cadastro-automatico-pdfs` (privado). Acesso só via edge function (signed URL).

Tabela nova `client_registration_automation_files`:
- `registration_id` uuid → client_registrations
- `file_path` text (path no bucket)
- `file_name` text
- `uploaded_at` timestamptz default now()

RLS: leitura para admin/backoffice/gestor e para o vendedor dono do cadastro.

Secret novo: `AUTOMATION_API_KEY` (gerado pelo Lovable, você copia e usa no sistema externo).

## 2. Edge functions (todas com `verify_jwt = false`, autenticadas via header `x-api-key`)

Base URL: `https://sbxltdbnqixucjoognfj.supabase.co/functions/v1`

### a) `automation-queue` — GET
Retorna lista de cadastros com `automation_status = 'pending'`. Resposta:
```json
[
  {
    "id": "uuid",
    "cpf": "...", "cnpj": "...",
    "salesperson": { "id": "...", "name": "...", "email": "..." },
    "client_name": "...", "client_phone": "..."
  }
]
```
Marca cada um como `processing` ao entregar (com `automation_started_at` e incrementa `automation_attempts`), para não devolver duas vezes.

### b) `automation-result` — POST
Body:
```json
{
  "registration_id": "uuid",
  "status": "success" | "error",
  "error_message": "texto quando erro",
  "files": [{ "name": "comprovante.pdf", "content_base64": "..." }]
}
```
- Se `success`: salva PDFs no bucket (`{registration_id}/{uuid}.pdf`), grava em `client_registration_automation_files`, seta `automation_status='success'`, `automation_finished_at=now()`, e atualiza `status='realizado'` + `completed_at`.
- Se `error`: grava `automation_error`, `automation_status='error'`.

### c) `automation-retry` — POST (chamada pelo frontend, JWT normal)
Body `{ registration_id }`. Volta `automation_status` para `pending`, limpa `automation_error`. Só admin/backoffice/gestor ou dono.

### d) `automation-file-url` — POST (frontend, JWT normal)
Body `{ file_id }`. Retorna signed URL temporária (1h) do PDF.

## 3. Frontend — coluna “Automação” na tabela de Cadastros

Em `RegistrationsTable.tsx`, nova coluna com badge clicável:

- `pending` → cinza “Na fila”
- `processing` → azul pulsante “Processando…”
- `success` → verde “Sucesso” (ícone check). **Click** abre modal com lista de PDFs (nome + botões Visualizar / Baixar via signed URL).
- `error` → vermelho “Erro” (ícone alerta). **Click** abre modal com `automation_error` + botão **Tentar novamente** (chama `automation-retry` e invalida o cache).

Sem nova rota — tudo dentro da aba Cadastros existente. Cadastros novos entram automaticamente em `pending` (default da coluna).

## 4. Documentação Markdown

Criar `docs/API_CADASTRO_AUTOMATICO.md` na raiz do projeto, descrevendo:

- Visão geral do fluxo (pull + callback)
- Como autenticar (`x-api-key: <AUTOMATION_API_KEY>`)
- Endpoint `GET /automation-queue` — exemplo curl + resposta
- Endpoint `POST /automation-result` — exemplo com PDF em base64
- Códigos de erro (401, 404, 409 se já finalizado, 422 validação)
- Recomendações de polling (sugestão: a cada 30s)
- Limite de tamanho de PDF (sugestão: 10 MB por arquivo)

Esse arquivo também fica disponível na aba Cadastros como link “Documentação da API” para você copiar e mandar pro dev do outro sistema.

## Detalhes técnicos

- Autenticação: comparação constante-time do header `x-api-key` com `Deno.env.get('AUTOMATION_API_KEY')`.
- Concorrência: `UPDATE ... WHERE automation_status='pending' RETURNING *` em transação para evitar duas máquinas pegarem o mesmo item.
- Validação dos PDFs com Zod (`name` obrigatório, `content_base64` string, tamanho máx).
- CORS aberto (`*`) nas três edge functions externas.
- Para a UI, criar hook `useRegistrationAutomation` (React Query) com `staleTime: 10s` para refletir mudanças do externo rapidamente.

## Pergunta opcional

Quer que eu já gere a `AUTOMATION_API_KEY` (eu peço pelo secret) ou prefere definir você mesmo o valor?
