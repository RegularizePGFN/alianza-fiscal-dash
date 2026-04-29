## Diagnóstico

Logs da edge function confirmam que o endpoint correto está sendo chamado:

```text
Browserless: chamando endpoint https://production-sfo.browserless.io/pdf
```

Sem erros 4xx/5xx. Mas o PDF baixado abre em branco e o painel da Browserless mostra 0 successful requests. Duas causas possíveis:

1. O `supabase.functions.invoke` no frontend está corrompendo a resposta binária `application/pdf` (interpreta como JSON quando o body chega como string ou quando há conflito de Content-Type), gerando um Blob inválido que o leitor de PDF abre como página em branco.
2. O painel da Browserless que você está vendo pode ser de outro workspace/região (token está em outra conta), ou a métrica leva alguns minutos para atualizar.

A causa #1 é a mais provável — explica exatamente "PDF em branco mas sem erro".

## Plano de correção

### 1. Trocar `supabase.functions.invoke` por `fetch` direto no `src/lib/pdf/generatePdf.ts`

Motivos:

- `invoke` tenta inferir o tipo da resposta e pode entregar string/JSON parcial.
- Com `fetch` controlamos `Accept: application/pdf` e lemos `res.blob()` diretamente, preservando os bytes.

Mudanças:

- Construir URL absoluta `${SUPABASE_URL}/functions/v1/generate-proposal-pdf`.
- Enviar headers `apikey` + `Authorization: Bearer <session.access_token | anon>`.
- Validar `res.ok` e `content-type`.
- Se vier `application/json`, tratar como erro e mostrar `error.message` no toast.
- Se vier `application/pdf`, ler `await res.blob()` e baixar.
- Validar `blob.size >= 1000` para detectar PDFs vazios.

### 2. Garantir Content-Length e tipo correto na edge function

`supabase/functions/generate-proposal-pdf/index.ts` já devolve `Content-Type: application/pdf` e `Content-Length`. Vou confirmar e, se necessário, garantir que o `Uint8Array` é entregue como `body` válido (sem wrapping).

### 3. Adicionar log de tamanho na edge function

Logar `pdfBytes.length` antes de responder, para confirmar nos logs do Supabase que o PDF foi gerado corretamente pela Browserless. Isso isola se o problema é geração (Browserless devolveu 0 bytes) ou transporte (frontend corrompendo).

### 4. Confirmar conta Browserless

Você está olhando o painel da conta certa? O token configurado em `BROWSERLESS_TOKEN` é o que aparece na URL do painel atual? Se for outra conta/região, as métricas podem aparecer em outro lugar. Mas isso é validação, não bloqueador — o importante é os logs do Supabase mostrarem que o `/pdf` retornou 200 com bytes.

## Arquivos previstos

- `src/lib/pdf/generatePdf.ts` — trocar `invoke` por `fetch` direto, validação de Content-Type, validação de tamanho mínimo, mensagens de erro reais.
- `supabase/functions/generate-proposal-pdf/index.ts` — adicionar `console.log("PDF size:", pdfBytes.length)` antes do return.

## Resultado esperado

- Botão "Baixar PDF" gera arquivo com bytes reais (não vazio).
- PDF abre com o layout completo da proposta, fiel ao preview.
- Caso a Browserless devolva erro, a mensagem real aparece no toast em vez de "Falha ao gerar PDF" genérico.
- Logs do Supabase mostram tamanho do PDF, facilitando diagnóstico futuro.