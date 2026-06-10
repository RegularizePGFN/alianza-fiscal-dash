## Objetivo
Permitir que o operador escolha entre dois modelos visuais de PDF antes de visualizar/baixar a proposta. Modelo 1 fica idêntico ao atual; Modelo 2 implementa o layout dos PDFs anexos, com destaque automático conforme houver ou não desconto.

## Mudanças no painel "Personalizar proposta"
Em `src/components/proposals/preview/OptionsSidebar.tsx`, adicionar uma nova seção (Accordion item) no topo chamada **"Modelo do PDF"** com dois cards de escolha (radio visual):

- **Modelo 1 – Clássico** (padrão atual; selo "atual")
- **Modelo 2 – Aliança** (novo layout em destaque)

A escolha grava em `formData.pdfTemplate` (`"classic"` | `"alianca"`). Estrutura preparada para futuros modelos (lista declarativa de templates).

## Tipos e estado
Em `src/lib/types/proposals.ts`, acrescentar:
```ts
pdfTemplate?: 'classic' | 'alianca'; // default: 'classic'
```
Nenhuma migração de banco — é um campo de UI que viaja junto do payload da proposta.

## Pré-visualização e download
Em `src/components/proposals/preview/ProposalPreviewLayout.tsx`:
- Selecionar dinamicamente o componente de preview conforme `formData.pdfTemplate`.
- Passar `pdfTemplate` para `generateProposalPdf` (que repassa à edge function).

Em `src/lib/pdf/generatePdf.ts`: incluir `pdfTemplate` no body do POST.

## Novo template (Modelo 2 – Aliança)
Criar **`src/components/proposals/pdf/AliancaPdfTemplate.tsx`** seguindo fielmente os PDFs anexos:

1. **Cabeçalho branco** com "ALIANÇA FISCAL / Consultoria Tributária" (logo oficial já existente em `/lovable-uploads/logo-alianca-fiscal.png`) à esquerda; à direita "PROPOSTA DE / REGULARIZAÇÃO PGFN" e "Emissão DD/MM/AAAA · Validade DD/MM/AAAA". Faixa fina gradiente azul→verde abaixo.
2. **"PROPOSTA PARA"** + nome do cliente + CNPJ.
3. **Bloco de destaque (auto)**:
   - **Com desconto** (`hasDiscount === true`): card azul-escuro com título "SUA ECONOMIA", valor economizado em destaque verde, subtítulo "em reduções de juros e multas concedidas pela PGFN", chip verde "−XX%", linha "Dívida original R$ X → você regulariza por R$ Y".
   - **Sem desconto**: mesmo card azul-escuro, título "SEU BENEFÍCIO", headline "Parcelamento sem juros", chip azul "SEM JUROS", subtítulo "Regularize sua dívida em até Nx sem nenhum acréscimo e suspenda as cobranças.", linha "Valor da dívida mantido R$ X · Nx de R$ Y".
4. **"SEU PLANEJAMENTO DE PAGAMENTOS"**: aviso explicando que hoje paga apenas honorários e que a 1ª parcela vence no último dia útil do mês; timeline com:
   - "Hoje · DD/MM" → "PAGUE HOJE — Honorários Aliança Fiscal" (valor `feesValue`).
   - "DD/MM/AAAA · último dia útil de {mes}" → "1ª parcela da negociação (PGFN)" (`installmentValue`).
   - Linha do mês seguinte → "2ª parcela da negociação".
   - "a partir de {mes+2}/{aa} · sempre no último dia útil" → "demais parcelas (3ª a Nª)".
5. **"OPÇÕES PARA A NEGOCIAÇÃO"**: dois cards — À vista (valor final / "Parcela única · desconto máximo aplicado" quando houver desconto, ou "Pagamento único da dívida" sem desconto) e Parcelado ("R$ X/mês · Entrada R$ 0,00 · 1ª parcela no último dia útil do mês").
6. **Faixa final azul-escuro** "Pronto para regularizar?" com CTA "Para iniciar hoje · R$ {honorários}".
7. **Linha "Dados cadastrais"** em texto pequeno cinza (situação, abertura, CNAE, endereço resumido, "Débito a confirmar" se não houver número).
8. **Rodapé**: "Aliança Fiscal · Especialista {nome} · {email}" à esquerda; "Documento confidencial..." e "Valores conforme simulação de DD/MM/AAAA, sujeitos a atualização da PGFN." à direita.

Detecção de desconto: reaproveitar a mesma lógica `hasDiscount` já usada hoje (compara `totalDebt`, `discountedValue`, `discountPercentage`).

## Cálculo de datas (último dia útil)
Reaproveitar `getLastBusinessDayOfMonth` já existente (`src/hooks/proposals/useDatesHandling`). Para gerar as três linhas da timeline:
- 1ª parcela = último dia útil do mês de emissão.
- 2ª parcela = último dia útil do mês seguinte.
- "Demais (3ª a Nª)" = rótulo `a partir de {mmm/aa}` calculado a partir do mês +2.
Pular sábados/domingos (já implementado). Feriados não entram no escopo agora.

## Edge function (PDF server-side)
Em `supabase/functions/generate-proposal-pdf/index.ts`:
- Ler `pdfTemplate` do payload (default `"classic"`).
- Refatorar `buildProposalHtml` para despachar entre `buildClassicHtml` (HTML atual, sem mudanças) e novo `buildAliancaHtml` (espelho do `AliancaPdfTemplate.tsx` em HTML/CSS inline, mesma lógica de auto-detecção e datas). Logo embutida como data URL (fluxo atual já faz isso).
- Redeploy da função após a alteração.

## Não muda
- Modelo 1 (visual, conteúdo, edge function path do clássico) permanece exatamente como hoje.
- Hooks de salvar/listar propostas, automação, histórico — sem alteração.

## Detalhes técnicos
- Lista de templates em `src/components/proposals/pdf/templates.ts`:
  ```ts
  export const PDF_TEMPLATES = [
    { id: 'classic', label: 'Modelo 1 – Clássico', description: '...' },
    { id: 'alianca', label: 'Modelo 2 – Aliança', description: '...' },
  ] as const;
  ```
  Facilita acrescentar Modelo 3+ depois.
- `AliancaPdfTemplate.tsx` usa estilos inline (mesma estratégia do template atual) para garantir paridade pixel-a-pixel entre preview e PDF gerado.

## Arquivos a criar
- `src/components/proposals/pdf/AliancaPdfTemplate.tsx`
- `src/components/proposals/pdf/templates.ts`

## Arquivos a editar
- `src/lib/types/proposals.ts` (campo `pdfTemplate`)
- `src/components/proposals/preview/OptionsSidebar.tsx` (seção "Modelo do PDF")
- `src/components/proposals/preview/ProposalPreviewLayout.tsx` (preview dinâmico + envio do `pdfTemplate`)
- `src/lib/pdf/generatePdf.ts` (envia `pdfTemplate` no payload)
- `supabase/functions/generate-proposal-pdf/index.ts` (roteia entre clássico e Aliança; deploy)

## Validação
- Trocar o seletor na sidebar → a prévia muda instantaneamente.
- Baixar com Modelo 1 → PDF idêntico ao atual.
- Baixar com Modelo 2, proposta COM desconto → faixa verde "SUA ECONOMIA" + valor e %.
- Baixar com Modelo 2, proposta SEM desconto → faixa azul "SEM JUROS" + "Parcelamento sem juros".
- Conferir datas: emitida em 10/06 → 1ª parcela 30/06, 2ª 31/07 (último dia útil correto, pulando finais de semana).
