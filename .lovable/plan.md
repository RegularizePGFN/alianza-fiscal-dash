
# API de cadastro automático — Integração

Integração **pull**: o sistema externo (sua automação) consulta a fila de cadastros pendentes daqui, executa o cadastro no Regularize, e devolve o resultado (sucesso + PDFs, ou erro + descrição).

---

## 🔑 Credenciais

- **Base URL**: `https://sbxltdbnqixucjoognfj.supabase.co/functions/v1`
- **API Key** (header `x-api-key`):
  ```
  QT9KrmZmMgdsx8NwTGDllg8dAziZm5BxkIsyKwnnh-E
  ```
  > ⚠️ Esta chave dá acesso total à fila e aos resultados. Guarde em variável de ambiente / vault no seu sistema de automação. Nunca commit em git.

Toda requisição deve mandar:
```
x-api-key: QT9KrmZmMgdsx8NwTGDllg8dAziZm5BxkIsyKwnnh-E
Content-Type: application/json
```

---

## 🔄 Fluxo end-to-end

```text
┌──────────────┐                  ┌─────────────────────┐
│  Intranet    │                  │ Sua automação       │
│  (Lovable)   │                  │ (sistema externo)   │
└──────┬───────┘                  └──────────┬──────────┘
       │                                     │
       │ 1. Vendedor cria cadastro           │
       │    automation_status = 'pending'    │
       │                                     │
       │   ◀─── 2. GET /automation-queue ───┤  (polling a cada 30s)
       │   ──── lista de pendentes ────▶    │
       │   (cada item já vira 'processing') │
       │                                     │
       │                                     │ 3. Faz cadastro
       │                                     │    no Regularize
       │                                     │
       │   ◀── 4. POST /automation-result ──┤
       │       sucesso + PDFs base64        │
       │       OU erro + mensagem           │
       │                                     │
       │ 5. UI mostra badge verde/vermelho  │
       │    Click abre modal c/ PDFs ou     │
       │    erro + botão "Tentar novamente" │
       │                                     │
       │ 6. Retry volta status p/ 'pending' │
       │    e o ciclo recomeça              │
```

---

## 📡 Endpoints

### 1. `GET /automation-queue`

Retorna até 50 cadastros pendentes. **Cada item retornado já é marcado como `processing`** no banco — então só chame quando estiver pronto pra processar. Se você crashar antes de mandar resultado, ele fica preso em `processing` (veja seção "Recuperação" abaixo).

**Request:**
```bash
curl -X GET https://sbxltdbnqixucjoognfj.supabase.co/functions/v1/automation-queue \
  -H "x-api-key: QT9KrmZmMgdsx8NwTGDllg8dAziZm5BxkIsyKwnnh-E"
```

**Response 200:**
```json
{
  "items": [
    {
      "id": "a3f4c2e1-8b9d-4f0a-9c1e-2d3b4a5c6d7e",
      "cpf": "12345678900",
      "cnpj": "12345678000190",
      "client_name": "Empresa Exemplo LTDA",
      "client_phone": "11999998888",
      "reason": "fazer_cadastro",
      "salesperson": {
        "id": "b1c2d3e4-...",
        "name": "João Vendedor",
        "email": "joao@aliancafiscal.com"
      },
      "created_at": "2026-05-21T18:30:00Z",
      "attempts": 0
    }
  ]
}
```

**Response 401:** `{"error":"invalid api key"}`

> ⚠️ `cpf` e `cnpj` podem vir `null` (só um dos dois costuma estar preenchido).

---

### 2. `POST /automation-result`

Devolve o resultado de **um** cadastro.

**Request body (sucesso):**
```json
{
  "registration_id": "a3f4c2e1-8b9d-4f0a-9c1e-2d3b4a5c6d7e",
  "status": "success",
  "files": [
    {
      "name": "comprovante-cadastro.pdf",
      "content_base64": "JVBERi0xLjQKJ..."
    },
    {
      "name": "procuracao.pdf",
      "content_base64": "JVBERi0xLjQKJ..."
    }
  ]
}
```

**Request body (erro):**
```json
{
  "registration_id": "a3f4c2e1-8b9d-4f0a-9c1e-2d3b4a5c6d7e",
  "status": "error",
  "error_message": "Certificado digital inválido ou expirado. Verifique no Regularize."
}
```

**Exemplo curl:**
```bash
curl -X POST https://sbxltdbnqixucjoognfj.supabase.co/functions/v1/automation-result \
  -H "x-api-key: QT9KrmZmMgdsx8NwTGDllg8dAziZm5BxkIsyKwnnh-E" \
  -H "Content-Type: application/json" \
  -d '{
    "registration_id": "a3f4...",
    "status": "success",
    "files": [{"name":"doc.pdf","content_base64":"JVBE..."}]
  }'
```

**Response 200:**
```json
{ "ok": true, "files_saved": 2 }
```

**Possíveis erros:**
- `401` — API key inválida
- `404` — `registration_id` não existe
- `409` — Cadastro já finalizado (sucesso/erro). Use retry no painel pra liberar.
- `422` — Validação: campo faltando, base64 inválido, arquivo > 10 MB, mais de 20 arquivos.

**Limites:**
- Máximo **10 MB** por PDF
- Máximo **20 arquivos** por chamada
- `error_message` máximo 2000 caracteres

---

## 🐍 Exemplo Python (cliente completo)

```python
import requests, base64, time
from pathlib import Path

BASE = "https://sbxltdbnqixucjoognfj.supabase.co/functions/v1"
HEADERS = {"x-api-key": "QT9KrmZmMgdsx8NwTGDllg8dAziZm5BxkIsyKwnnh-E"}

def fetch_queue():
    r = requests.get(f"{BASE}/automation-queue", headers=HEADERS, timeout=30)
    r.raise_for_status()
    return r.json()["items"]

def report_success(reg_id, pdf_paths):
    files = []
    for p in pdf_paths:
        content = Path(p).read_bytes()
        files.append({
            "name": Path(p).name,
            "content_base64": base64.b64encode(content).decode()
        })
    r = requests.post(f"{BASE}/automation-result",
        headers={**HEADERS, "Content-Type": "application/json"},
        json={"registration_id": reg_id, "status": "success", "files": files},
        timeout=120)
    r.raise_for_status()

def report_error(reg_id, msg):
    requests.post(f"{BASE}/automation-result",
        headers={**HEADERS, "Content-Type": "application/json"},
        json={"registration_id": reg_id, "status": "error", "error_message": msg},
        timeout=30).raise_for_status()

def worker_loop():
    while True:
        try:
            items = fetch_queue()
            for item in items:
                try:
                    # ... sua lógica de cadastro no Regularize ...
                    pdfs = fazer_cadastro(item["cnpj"] or item["cpf"], item["salesperson"]["email"])
                    report_success(item["id"], pdfs)
                except Exception as e:
                    report_error(item["id"], str(e)[:2000])
        except Exception as e:
            print(f"Erro no loop: {e}")
        time.sleep(30)  # polling a cada 30s

if __name__ == "__main__":
    worker_loop()
```

---

## 🟢 Exemplo Node.js

```js
const BASE = "https://sbxltdbnqixucjoognfj.supabase.co/functions/v1";
const KEY  = "QT9KrmZmMgdsx8NwTGDllg8dAziZm5BxkIsyKwnnh-E";

async function fetchQueue() {
  const r = await fetch(`${BASE}/automation-queue`, { headers: { "x-api-key": KEY } });
  if (!r.ok) throw new Error(await r.text());
  return (await r.json()).items;
}

async function reportSuccess(regId, files) {
  // files: [{name, contentBuffer}]
  const body = {
    registration_id: regId,
    status: "success",
    files: files.map(f => ({ name: f.name, content_base64: f.contentBuffer.toString("base64") })),
  };
  const r = await fetch(`${BASE}/automation-result`, {
    method: "POST",
    headers: { "x-api-key": KEY, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(await r.text());
}
```

---

## ♻️ Recuperação e retry

- Se sua automação **crashou no meio** e o item ficou em `processing`, ele **não volta sozinho** pra fila. No painel da intranet vai aparecer "Processando..." indefinidamente. Solução: o admin/backoffice clica em **Tentar novamente** no badge, e ele volta pra `pending`.
- Se sua automação **mandar erro**, ele fica como `error` no painel. O usuário vê a mensagem e pode clicar em **Tentar novamente** → volta pra `pending`.
- Não há limite de retentativas. O campo `attempts` é incrementado a cada vez que o item é entregue na queue.

---

## 📋 O que será implementado na intranet

### Banco
- Colunas novas em `client_registrations`: `automation_status` (`pending`/`processing`/`success`/`error`, default `pending`), `automation_started_at`, `automation_finished_at`, `automation_error`, `automation_attempts`.
- Tabela nova `client_registration_automation_files` com `registration_id`, `file_path`, `file_name`, `uploaded_at`.
- Bucket privado `cadastro-automatico-pdfs` (acesso só via signed URL, autorizado via RLS).
- Secret `AUTOMATION_API_KEY` = `QT9KrmZmMgdsx8NwTGDllg8dAziZm5BxkIsyKwnnh-E`.

### Edge functions
| Nome | Método | Auth | Quem chama |
|------|--------|------|-----------|
| `automation-queue` | GET | `x-api-key` | Sua automação |
| `automation-result` | POST | `x-api-key` | Sua automação |
| `automation-retry` | POST | JWT (login) | Frontend (botão tentar novamente) |
| `automation-file-url` | POST | JWT (login) | Frontend (visualizar/baixar PDF) |

Todas com CORS aberto e `verify_jwt = false` (validação manual via api-key ou getClaims).

### Frontend — coluna "Automação" na tabela de Cadastros
- **`pending`** → badge cinza "Na fila"
- **`processing`** → badge azul pulsante "Processando…"
- **`success`** → badge verde "Sucesso" (ícone check). Click → modal lista os PDFs com botões **Visualizar** (abre em nova aba) e **Baixar** via signed URL (1h).
- **`error`** → badge vermelho "Erro" (ícone alerta). Click → modal mostra `automation_error` + botão **Tentar novamente**.

Polling do frontend a cada 10s (React Query) pra refletir mudanças do externo rapidamente.

### Documentação
- `docs/API_CADASTRO_AUTOMATICO.md` (cópia desse plano, sem a chave) salvo no projeto.

---

## 🧪 Como testar a integração

1. Pelo painel, crie um cadastro novo (CPF ou CNPJ). Ele já entra como `pending`.
2. Do seu sistema externo: `GET /automation-queue` → deve aparecer o item.
3. Confirme no painel: status mudou para "Processando…".
4. Mande `POST /automation-result` com `status: "success"` + 1 PDF de teste.
5. No painel: badge fica verde. Click → o PDF aparece no modal, dá pra baixar.
6. Crie outro cadastro, devolva com `status: "error"` → badge vermelho, modal mostra a mensagem.
7. Click "Tentar novamente" → volta pra `pending`, automação pega de novo.

---

## ❓ Pontos abertos (me avisa antes de eu implementar se quiser mudar)

- **Polling vs realtime**: optei por polling 30s do seu lado. Quer webhook (a intranet te avisa quando novo cadastro entra)? Dá mais trabalho.
- **Apenas cadastros novos vão pra fila**, ou os existentes em `aguardando` que já estão no banco também devem entrar como `pending`? Por padrão vou marcar **todos os existentes como `pending`** na migration.
- **Cadastros do tipo `cancelado`** não devem entrar na fila (vou filtrar).
