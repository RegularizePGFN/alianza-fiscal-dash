## Ajustes finos no PDF

### 1. Trocar a logomarca

A logo atual (`/lovable-uploads/d939ccfc-...png`) não está carregando no Chromium remoto. Vou:

- Salvar o novo PNG enviado em `public/lovable-uploads/logo-alianca-fiscal.png`.
- Atualizar `src/lib/pdf/generatePdf.ts` para enviar essa nova URL absoluta como `logoUrl`.
- Como camada extra de segurança contra falha de download de imagem dentro do Browserless, vou converter a logo para `data:image/png;base64,...` no frontend antes de enviar para a edge function. Assim o Chromium não precisa baixar nada da rede e a logo nunca falha.

### 2. Cor do cabeçalho como no site

No site da Aliança Fiscal o tema é navy escuro com detalhe dourado/bege. Vou trocar o gradiente azul claro atual por:

- Fundo: navy escuro `#0b1d3a` (com leve gradient para `#0a1a35`).
- Borda inferior do header: `#d4c5a0` (bege da logo) em vez do verde atual.
- Título em fonte serifada (Playfair Display) para combinar com o estilo do site.

### 3. Rodapé fixo na borda inferior do PDF

Hoje o rodapé escuro aparece flutuando no meio da folha porque o conteúdo não preenche os 297mm da página A4. Vou corrigir transformando a página em flex column de altura A4 fixa:

```text
.page { height: 297mm; display: flex; flex-direction: column; }
.content { flex: 1 1 auto; display: flex; flex-direction: column; }
.body { flex: 1 1 auto; }   /* empurra o footer pra base */
.footer { flex-shrink: 0; } /* sempre encostado embaixo */
```

Isso garante que o rodapé fique sempre colado na borda inferior do A4, independente de quanto conteúdo a proposta tenha.

### 4. Pequenos ajustes visuais consistentes

- Cor da marca d'água: trocar de `#0f172a` para o navy `#0b1d3a` para combinar com o novo tema.
- Cor do texto "Especialista responsável" e disclaimer continuam como estão.

## Arquivos previstos

- `public/lovable-uploads/logo-alianca-fiscal.png` (novo arquivo)
- `src/lib/pdf/generatePdf.ts` — converter logo para base64 antes de enviar.
- `supabase/functions/generate-proposal-pdf/index.ts` — header navy, footer fixo na base, layout flex de altura A4.

## Resultado esperado

- Logo aparece no header sem falhar.
- Header navy escuro, igual ao site.
- Rodapé escuro grudado na borda inferior do PDF, não flutuando no meio.
- Layout fiel ao preview, profissional.