## Diagnóstico do erro 401

A função atual usa um único secret `BROWSERLESS_URL` esperando que ele já contenha o token embutido (ex: `https://production-sfo.browserless.io?token=ABC`). O log mostra:

```
Browserless falhou: 401 Invalid API key. Please check your API key and try again.
```

Causas prováveis:
1. O secret `BROWSERLESS_URL` está sem `?token=...` no final, ou
2. Tem o token mas a URL base está no domínio antigo (`chrome.browserless.io`), ou
3. O token está expirado/inválido.

Além disso, o endpoint `/pdf` do Browserless v2 exige o token como **query string** (`?token=...`), não como header. O código atual concatena `/pdf` mas não garante que o `?token=` venha depois corretamente.

## Plano de correção

### 1. Separar URL e token em dois secrets

Vou pedir para você adicionar/atualizar:

- **`BROWSERLESS_URL`** → apenas a URL base, sem token. Ex: `https://production-sfo.browserless.io` (recomendado pela Browserless atual) ou `https://chrome.browserless.io` (legado).
- **`BROWSERLESS_TOKEN`** → apenas o token (a API key pura, sem `?token=`).

Isso elimina ambiguidade e segue exatamente o padrão pedido (`BROWSERLESS_TOKEN` separado).

### 2. Reescrever `renderPdfWithBrowserless`

```text
endpoint = `${BROWSERLESS_URL}/pdf?token=${BROWSERLESS_TOKEN}`
```

Ordem correta de query params: token sempre antes de outros. Compatível com Browserless v1 e v2.

### 3. Manter o método REST `/pdf` (não WebSocket)

Você pediu "Puppeteer connect via WebSocket", mas dentro de uma **Supabase Edge Function (Deno)** isso é inviável:
- Puppeteer-core é pacote Node, não roda nativo em Deno edge runtime
- Edge Functions têm CPU time limit de ~2s wall time inicial; abrir WebSocket + navegar + render gasta muito mais
- O endpoint REST `/pdf` da Browserless faz **exatamente a mesma coisa** internamente (Puppeteer + `page.pdf()`) e devolve o binário pronto

A API REST é a forma oficial recomendada pela Browserless para integrações server-to-server e respeita 100% as opções do Puppeteer (`printBackground`, `preferCSSPageSize`, `format: A4`, `margin: 0`, `waitUntil: networkidle0`). Resultado idêntico, sem complexidade.

Se mais tarde quiser realmente usar Puppeteer via WebSocket, a forma correta é mover para um worker Node externo (Cloudflare Worker, Railway, etc.), o que é uma decisão de infra separada.

### 4. Melhorar o tratamento de erros

- Validar os dois secrets no boot e retornar mensagem clara (`BROWSERLESS_TOKEN ausente`)
- Logar tentativa (sem expor token) com `endpoint base`
- Em caso de 401/403, devolver mensagem amigável: "Token Browserless inválido — verifique BROWSERLESS_TOKEN nos Secrets"

### 5. Garantir fidelidade visual (já está bom, ajustes finos)

O HTML atual já:
- Usa Inter via Google Fonts
- Tem largura A4 via `@page { size: A4 }` + `preferCSSPageSize: true`
- Margens zero (controladas pelo CSS interno `.page`)
- `printBackground: true`

Vou apenas:
- Aumentar `waitForTimeout` para `800ms` (garante font swap completo)
- Adicionar `waitForSelector: 'body'` defensivo
- Adicionar `<link rel="preconnect">` para Google Fonts

### 6. Frontend

`src/lib/pdf/generatePdf.ts` já invoca a função corretamente. **Sem mudanças necessárias** — a interface continua a mesma.

### 7. html2canvas como fallback opcional

Mantenho `generateProposalTemplatePng` (PNG via html2canvas) intacto — é usado para a função "PNG" do botão lateral, não para PDF. O método antigo de PDF via html2canvas/jsPDF **já foi removido** anteriormente. Não há nada para limpar.

## Arquivos modificados

- **`supabase/functions/generate-proposal-pdf/index.ts`**: ajusta `renderPdfWithBrowserless` para usar `BROWSERLESS_URL` + `BROWSERLESS_TOKEN` separados, melhora tratamento de erro, ajusta tempo de espera de fontes.

## Secrets necessários

Já existe `BROWSERLESS_URL`. Vou pedir o `BROWSERLESS_TOKEN` separadamente após você aprovar o plano. Você só precisa colar a API key pura da Browserless (sem `?token=`).

## Resultado esperado

- PDF vetorial real (texto selecionável, cópia funciona)
- 1:1 com o preview (mesmo HTML/CSS, mesmo Chromium)
- Margens corretas, sem brancos extras
- Download em ~2-4s
- Erros claros se o token expirar no futuro
