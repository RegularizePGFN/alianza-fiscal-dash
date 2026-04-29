# Plano: Validação obrigatória + correções no PDF

## 1. Tornar CNPJ e dados do cliente obrigatórios

### Comportamento desejado
- O usuário **deve** preencher CNPJ, Nome/Razão Social, Telefone, Email e Atividade Principal antes de clicar em "Gerar Proposta".
- O preenchimento automático via consulta de CNPJ continua funcionando como hoje (não muda nada nesse fluxo).
- Se o CNPJ tiver menos de 14 dígitos ou algum campo estiver vazio, o botão "Gerar Proposta" fica desabilitado e mostramos uma dica do que falta.
- Visual: asterisco vermelho (`*`) ao lado das labels obrigatórias e borda vermelha + mensagem inline quando o campo perder o foco vazio.

### Onde mexer
- `src/components/proposals/data-form/ClientInfoSection.tsx` — adicionar marcação `*` nas labels obrigatórias e validação visual (borda `border-destructive` quando vazio após blur). Validar formato do CNPJ (14 dígitos numéricos).
- `src/pages/proposals/components/tabs/DataTabContent.tsx` — calcular `isClientDataValid` (CNPJ 14 dígitos + nome + telefone + email + atividade preenchidos) e desabilitar o botão "Gerar Proposta" quando inválido. Mostrar texto auxiliar listando o que falta.
- `src/hooks/proposals/useProposalGeneration.tsx` — guard adicional no `handleGenerateProposal` que aborta com toast caso a validação falhe (segurança extra, caso o botão seja acionado por atalho).

## 2. Corrigir margem branca em excesso no PDF

### Diagnóstico
No `generatePdf.ts` a altura do PDF de página única é calculada por `(canvas.height * 210) / canvas.width`. O `html2canvas` captura `scrollHeight` do elemento, que inclui qualquer overflow invisível (a marca d'água posicionada com `inset: 0` em um container `position: relative` não estende, mas o offscreen host de 794px não tem `overflow: hidden`, e o template usa `position: relative` no wrapper externo — isso permite que o div da marca d'água, mesmo com `inset: 0`, expanda o `scrollHeight` quando o texto rotacionado ultrapassa visualmente os limites).

### Correções
- Em `src/components/proposals/pdf/ProposalPdfTemplate.tsx`: adicionar `overflow: 'hidden'` ao wrapper externo (o `<div ref>`), garantindo que a marca d'água não estenda a área capturada.
- Em `src/lib/pdf/generatePdf.ts`: aplicar `host.style.overflow = 'hidden'` e medir altura via `element.getBoundingClientRect().height` em vez de `scrollHeight` para evitar pegar overflow oculto.

## 3. Corrigir alinhamento do badge "50% off"

### Diagnóstico
No componente `SummaryCard` (linhas 559–581 do `ProposalPdfTemplate.tsx`), o badge usa `display: inline-flex`, `alignItems: 'center'`, `padding: '3px 8px'`, `lineHeight: 1`. O `html2canvas` renderiza fontes com baseline ligeiramente deslocada — visualmente o texto "50% off" fica empurrado para a parte inferior do retângulo arredondado (visível tanto no PNG quanto no PDF).

### Correções
- Trocar para `display: 'flex'` com `height` fixa (`height: '18px'`), `padding: '0 9px'`, `lineHeight: '18px'` e remover `alignItems`/`justifyContent` (o line-height igual à altura centraliza verticalmente de forma confiável no html2canvas).
- Aumentar levemente o `top` para `7px` para encostar melhor no canto superior do card.
- Garantir `fontFamily` herdado (Inter) explicitamente no badge para evitar fallback que altera métricas.

## Detalhes técnicos resumidos

```text
Arquivos a editar:
  src/components/proposals/data-form/ClientInfoSection.tsx
  src/pages/proposals/components/tabs/DataTabContent.tsx
  src/hooks/proposals/useProposalGeneration.tsx
  src/components/proposals/pdf/ProposalPdfTemplate.tsx
  src/lib/pdf/generatePdf.ts

Validação cliente: CNPJ regex /^\d{14}$/ + nome/telefone/email/atividade não vazios.
PDF: overflow hidden no wrapper + getBoundingClientRect().height para altura real.
Badge: height fixa + lineHeight numérico igual à altura.
```

## Resultado esperado
- Não é possível gerar proposta sem CNPJ válido e dados do cliente preenchidos.
- PDF gerado fica com a altura exata do conteúdo (sem rodapé branco extra).
- Badge "50% off" fica visualmente centralizado no retângulo verde, igual no PNG e no PDF.
