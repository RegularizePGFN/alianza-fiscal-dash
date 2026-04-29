## Diagnóstico

O erro atual não é mais de layout do PDF; é falha na chamada ao Browserless.

Pelos logs recentes da Edge Function:

```text
Browserless: chamando endpoint https://production-sfo.browserless.io/function/pdf
Browserless falhou: 404 Not Found
```

Isso indica que a função está montando o endpoint errado. A API REST correta do Browserless para PDF é:

```text
POST https://production-sfo.browserless.io/pdf?token=SEU_TOKEN
```

Mas a função está chamando:

```text
https://production-sfo.browserless.io/function/pdf
```

Além disso, os secrets atuais disponíveis são:

```text
BROWSERLESS_TOKEN
EVOLUTION_API_KEY
EVOLUTION_API_URL
LOVABLE_API_KEY
```

Ou seja: `BROWSERLESS_TOKEN` existe, mas `BROWSERLESS_URL` não está configurado. A implementação atual ainda depende de `BROWSERLESS_URL`, o que deixa a integração frágil e pode herdar uma URL antiga/malformada.

## Plano de correção

### 1. Corrigir a URL do Browserless de forma definitiva

Vou alterar `supabase/functions/generate-proposal-pdf/index.ts` para:

- Usar `BROWSERLESS_TOKEN` como obrigatório.
- Tratar `BROWSERLESS_URL` como opcional.
- Se `BROWSERLESS_URL` não existir, usar automaticamente:

```text
https://production-sfo.browserless.io
```

- Normalizar a URL para remover caminhos inválidos, especialmente:

```text
/function
/function/pdf
/pdf
?token=...
```

- Montar sempre o endpoint final assim:

```text
${base}/pdf?token=${BROWSERLESS_TOKEN}
```

Resultado esperado:

```text
https://production-sfo.browserless.io/pdf?token=...
```

### 2. Melhorar mensagens de erro para o usuário

Hoje o botão mostra apenas “Falha ao gerar PDF.”, sem explicar o motivo.

Vou ajustar o fluxo para que a mensagem real da Edge Function seja exibida quando fizer sentido, por exemplo:

- Token Browserless inválido.
- Endpoint Browserless incorreto.
- Browserless retornou PDF vazio.
- Timeout ao renderizar.

Isso facilita manutenção sem expor o token.

### 3. Ajustar resposta binária da Edge Function no frontend

Vou revisar `src/lib/pdf/generatePdf.ts` para garantir que a resposta `application/pdf` da Edge Function seja tratada corretamente como `Blob`/`ArrayBuffer` e que respostas JSON de erro não sejam baixadas como PDF inválido.

### 4. Manter Browserless como motor principal

A geração principal continuará sendo:

```text
React app -> Supabase Edge Function -> Browserless Chromium /pdf -> PDF binário -> download
```

Não vou transformar `pdf-lib` em solução principal.

`html2canvas` continuará apenas para PNG/uso secundário, não para o PDF principal.

### 5. Deploy e validação

Após aprovação, vou:

- Editar a Edge Function.
- Ajustar o handler frontend, se necessário.
- Garantir que `supabase/config.toml` continue com a função habilitada.
- Deployar/testar a Edge Function usando o secret já existente `BROWSERLESS_TOKEN`.
- Conferir nos logs que o endpoint chamado é `/pdf`, não `/function/pdf`.

## Arquivos previstos

- `supabase/functions/generate-proposal-pdf/index.ts`
- `src/lib/pdf/generatePdf.ts` se necessário para melhorar tratamento de erro/binário

## Observação importante

A raiz do erro atual é endpoint incorreto, não falta do token. O secret `BROWSERLESS_TOKEN` já existe; o que precisa ser corrigido agora é a montagem segura da URL para impedir chamadas como `/function/pdf`.