# API de Cadastro Automático

Integração **pull**: seu sistema externo de automação consulta a fila de cadastros pendentes daqui, processa, e devolve o resultado (sucesso + PDFs, ou erro + descrição).

---

## 🔑 Credenciais

- **Base URL**: `https://sbxltdbnqixucjoognfj.supabase.co/functions/v1`
- **API Key**: configure no seu sistema como variável de ambiente `AUTOMATION_API_KEY` (mesma string guardada como secret na intranet).

Toda requisição precisa enviar:

```
x-api-key: <AUTOMATION_API_KEY>
Content-Type: application/json
```

> ⚠️ Nunca commit a chave em git. Mantenha em vault / variável de ambiente.

---

## 🔄 Fluxo end-to-end

```text
┌──────────────┐                  ┌─────────────────────┐
│  Intranet    │                  │ Sua automação       │
└──────┬───────┘                  └──────────┬──────────┘
       │                                     │
       │ 1. Vendedor cria cadastro           │
       │    automation_status = 'pending'    │
       │                                     │
       │   ◀─── 2. GET /automation-queue ───┤  (polling a cada 30s)
       │   ──── lista de pendentes ────▶    │
       │   (cada item já vira 'processing') │
       │                                     │
       │                                     │ 3. Processa cadastro
       │                                     │
       │   ◀── 4. POST /automation-result ──┤
       │       sucesso + PDFs base64        │
       │       OU erro + mensagem           │
       │                                     │
       │ 5. UI mostra badge verde/vermelho  │
       │    com PDFs ou botão "Tentar"      │
```

---

## 📡 Endpoints

### `GET /automation-queue`

Retorna até **50 cadastros pendentes**. Cada item retornado é imediatamente marcado como `processing` no banco — só chame quando estiver pronto para processar.

**Request:**

```bash
curl -X GET https://sbxltdbnqixucjoognfj.supabase.co/functions/v1/automation-queue \
  -H "x-api-key: $AUTOMATION_API_KEY"
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
      "attempts": 1
    }
  ]
}
```

`cpf` e `cnpj` podem vir `null` (geralmente só um está preenchido). `reason` pode ser `fazer_cadastro`, `alterar_cadastro`, `receita_federal` ou `cancelar_acesso`.

**Erros:** `401` chave inválida, `405` método errado.

---

### `POST /automation-result`

Devolve o resultado de **um** cadastro.

**Body sucesso:**

```json
{
  "registration_id": "a3f4c2e1-8b9d-4f0a-9c1e-2d3b4a5c6d7e",
  "status": "success",
  "files": [
    { "name": "comprovante-cadastro.pdf", "content_base64": "JVBERi0xLjQKJ..." },
    { "name": "procuracao.pdf", "content_base64": "JVBERi0xLjQKJ..." }
  ]
}
```

**Body erro:**

```json
{
  "registration_id": "a3f4c2e1-8b9d-4f0a-9c1e-2d3b4a5c6d7e",
  "status": "error",
  "error_message": "Certificado digital inválido ou expirado."
}
```

**Exemplo curl:**

```bash
curl -X POST https://sbxltdbnqixucjoognfj.supabase.co/functions/v1/automation-result \
  -H "x-api-key: $AUTOMATION_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"registration_id":"a3f4...","status":"success","files":[{"name":"doc.pdf","content_base64":"JVBE..."}]}'
```

**Response 200:** `{ "ok": true, "files_saved": 2 }`

**Erros:**

- `401` API key inválida
- `404` `registration_id` não existe
- `409` Cadastro já finalizado (sucesso/erro). Peça retry no painel para liberar.
- `422` Validação: campo faltando, base64 inválido, arquivo > 10 MB, mais de 20 arquivos.

**Limites:**

- Máximo **10 MB** por PDF
- Máximo **20 arquivos** por chamada
- `error_message` máximo 2000 caracteres
- Quando `status=success` e o cadastro é finalizado, a intranet também marca o `status` interno como `realizado`.

---

## 🐍 Cliente Python completo

```python
import os, requests, base64, time
from pathlib import Path

BASE = "https://sbxltdbnqixucjoognfj.supabase.co/functions/v1"
HEADERS = {"x-api-key": os.environ["AUTOMATION_API_KEY"]}

def fetch_queue():
    r = requests.get(f"{BASE}/automation-queue", headers=HEADERS, timeout=30)
    r.raise_for_status()
    return r.json()["items"]

def report_success(reg_id, pdf_paths):
    files = [
        {"name": Path(p).name, "content_base64": base64.b64encode(Path(p).read_bytes()).decode()}
        for p in pdf_paths
    ]
    r = requests.post(
        f"{BASE}/automation-result",
        headers={**HEADERS, "Content-Type": "application/json"},
        json={"registration_id": reg_id, "status": "success", "files": files},
        timeout=120,
    )
    r.raise_for_status()

def report_error(reg_id, msg):
    requests.post(
        f"{BASE}/automation-result",
        headers={**HEADERS, "Content-Type": "application/json"},
        json={"registration_id": reg_id, "status": "error", "error_message": msg[:2000]},
        timeout=30,
    ).raise_for_status()

def worker_loop():
    while True:
        try:
            for item in fetch_queue():
                try:
                    pdfs = fazer_cadastro(item["cnpj"] or item["cpf"], item["salesperson"]["email"])
                    report_success(item["id"], pdfs)
                except Exception as e:
                    report_error(item["id"], str(e))
        except Exception as e:
            print(f"Loop error: {e}")
        time.sleep(30)

if __name__ == "__main__":
    worker_loop()
```

---

## 🟢 Cliente Node.js

```js
const BASE = "https://sbxltdbnqixucjoognfj.supabase.co/functions/v1";
const KEY = process.env.AUTOMATION_API_KEY;

async function fetchQueue() {
  const r = await fetch(`${BASE}/automation-queue`, { headers: { "x-api-key": KEY } });
  if (!r.ok) throw new Error(await r.text());
  return (await r.json()).items;
}

async function reportSuccess(regId, files /* [{name, contentBuffer}] */) {
  const body = {
    registration_id: regId,
    status: "success",
    files: files.map((f) => ({ name: f.name, content_base64: f.contentBuffer.toString("base64") })),
  };
  const r = await fetch(`${BASE}/automation-result`, {
    method: "POST",
    headers: { "x-api-key": KEY, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(await r.text());
}

async function reportError(regId, message) {
  await fetch(`${BASE}/automation-result`, {
    method: "POST",
    headers: { "x-api-key": KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ registration_id: regId, status: "error", error_message: message }),
  });
}
```

---

## ♻️ Recuperação e retry

- **Crash da automação no meio**: o item fica preso em `processing`. No painel da intranet, qualquer admin/backoffice/gestor clica em **Forçar reenviar** no badge para voltar para `pending`.
- **Resultado de erro**: o item fica em `error`. O usuário vê a mensagem e clica em **Tentar novamente** → volta para `pending`.
- Sem limite de retentativas. O campo `attempts` é incrementado a cada vez que o item é entregue na fila.

---

## 🧪 Como testar

1. Pelo painel da intranet, crie um cadastro novo (CPF ou CNPJ). Ele já entra como `pending`.
2. Sua automação: `GET /automation-queue` → o item aparece.
3. Confira no painel: status mudou para "Processando…".
4. Mande `POST /automation-result` com `status: "success"` + 1 PDF de teste.
5. Painel: badge fica verde. Clique → PDF aparece no modal, dá pra baixar/visualizar.
6. Crie outro cadastro, devolva `status: "error"` → badge vermelho, modal mostra a mensagem + botão "Tentar novamente".

---

## 📝 Notas

- Recomendado: polling a cada **30s**.
- Cadastros com `status` interno = `cancelado` **não** entram na fila.
- Os PDFs ficam num bucket privado da intranet — somente usuários autorizados conseguem baixar via signed URL temporária.
