
# Plano — Separar Histórico + Corrigir fidelidade do PNG/PDF

## Parte 1 — Abas no topo da página de Propostas

Hoje a tela `/propostas` carrega tudo junto na aba "Upload": o gerador (upload + IA) **e** o dashboard de propostas + histórico (cards, filtro, tabela). Isso pesa e confunde.

### O que muda

Adicionar **duas abas principais** no topo da página (acima do stepper atual), no estilo "tabs premium":

```text
[ ✨ Gerar Proposta ]   [ 📚 Histórico de Propostas ]
```

- **Gerar Proposta** (default ao entrar): mostra apenas o stepper (Upload → Dados → Proposta). O dashboard administrativo e o histórico **somem** daqui.
- **Histórico de Propostas**: só carrega quando o usuário clica. Contém:
  - O `ProposalsDashboard` (cards de propostas geradas hoje, por vendedor, etc. — visível só para admin)
  - Os `ProposalsSummaryCards` (resumo do período)
  - O `ProposalsDateFilter`
  - A tabela `ProposalHistory`

### Lazy loading (performance)

- O hook `useFetchProposalsWithFilter` hoje dispara `fetchProposals` no mount via `useEffect`. Vamos torná-lo **sob demanda**: só busca quando a aba "Histórico" é montada pela primeira vez (ou quando o filtro muda dentro dela).
- O `ProposalsDashboard` será montado dentro da aba Histórico, então também só carrega quando clicado (já dispara várias queries pesadas).
- O botão "Atualizar" do header passa a ser contextual: só aparece (ou só age) quando estamos na aba Histórico.

### Arquivos afetados

- `src/pages/proposals/ProposalsContainer.tsx` — adicionar estado `mainTab: 'generate' | 'history'`, renderizar a barra de abas e condicionalmente cada bloco.
- `src/pages/proposals/components/tabs/UploadTabContent.tsx` — remover o bloco "Histórico" (cards + filtro + tabela). A aba Upload do stepper passa a ter só o `AIImageProcessor`.
- `src/hooks/proposals/useProposalsStateWithFilter.tsx` — remover o `useEffect` automático de fetch no mount; expor a função para a aba Histórico chamar.
- Criar `src/pages/proposals/components/HistoryTabContent.tsx` agrupando dashboard + cards + filtro + tabela (movido do UploadTabContent).
- Criar `src/pages/proposals/components/MainTabsBar.tsx` com o visual das abas (botões grandes com ícone, badge de contagem opcional).

## Parte 2 — Preview ≠ PNG/PDF (corrigir bugs visuais)

### Diagnóstico dos prints

Comparando o **print 2** (preview no app — perfeito) com o **print 1 (PDF)** e **print 3 (PNG)**:

1. **Badge "50% off" desalinhado no PNG/PDF** — no preview o badge fica colado no canto superior direito do card "Economia"; no PNG aparece deslocado para baixo. Causa: o badge usa `position: absolute` dentro do `SummaryCard`, mas o card pai não tem `position: relative` declarado explicitamente (ou tem padding diferente). Quando o `html2canvas` captura, a referência muda.
2. **Preview no app aparece "bugado" no PDF (print 1)** — o thumbnail do leitor de PDF mostra o conteúdo cortado/comprimido. Isso é o `html2canvas` capturando uma altura maior que A4 e o `jsPDF` paginando errado: o template renderiza com altura natural maior que 297mm e o algoritmo atual (`addImage` em loop com offset negativo) gera uma segunda página em branco / corte estranho.
3. **PNG mais fiel que PDF** — confirma que o template em si está OK; o problema é no pipeline de PDF (paginação) e em pequenos ajustes inline de CSS que o html2canvas interpreta diferente.

### Correções no `ProposalPdfTemplate.tsx`

- Tornar o componente `SummaryCard` 100% determinístico: usar wrapper com `position: relative`, `overflow: hidden`, e o badge com top/right fixos em px (não %). Garantir `display: 'inline-flex'` no badge com `lineHeight: 1` para evitar drift vertical do html2canvas.
- Forçar `box-sizing: border-box` em todos os blocos via wrapper raiz (`<div style={{ boxSizing: 'border-box', ... }}>` + um pequeno reset inline aplicado nos filhos críticos).
- Remover `gradient` em `linear-gradient(180deg, #f0f5fd 0%, #ffffff 100%)` no card "Parcelado" — em alguns navegadores o html2canvas renderiza gradient com banda visível; substituir por cor sólida `#f0f5fd` (visualmente idêntico no print).
- Ajustar a altura do template para se aproximar de uma página A4 cheia, evitando "pular" para a 2ª página em branco. Hoje o conteúdo costuma ficar entre 297mm e ~310mm — o suficiente para criar página fantasma.

### Correções no `src/lib/pdf/generatePdf.ts`

- **Estratégia de uma página única quando o conteúdo cabe**: medir `element.scrollHeight` em px, converter para mm (`px * 25.4 / (96 * scale)`) e:
  - Se `<= 297mm + tolerância (8mm)`: gerar PDF de **uma página só**, com `pdf.addImage(..., 0, 0, 210, alturaReal)` e ajustando a altura do PDF via `jsPDF.format = [210, alturaReal]` (PDF custom de uma página com proporção exata). Isso garante que o PDF fica idêntico ao PNG.
  - Se for maior: paginar corretamente fatiando o canvas em blocos de altura A4 (criar canvas intermediário por página em vez do truque de offset negativo, que está causando o "bugado").
- Aumentar o tempo de espera pós-render para 300ms e aguardar `requestAnimationFrame` 3x (evita capturar antes do gradient/fontes).
- Usar `imageTimeout: 0` e garantir que o logo `/lovable-uploads/...png` esteja com `crossOrigin="anonymous"` (já está) e pré-carregado via `new Image()` antes do `html2canvas`.

### Resultado esperado

- PDF passa a ser **pixel-idêntico ao PNG** (mesmo template, mesma captura, só muda o container de saída).
- Badge "50% off" alinhado corretamente no canto.
- Sem páginas em branco / cortes estranhos no PDF.

## Detalhes técnicos resumidos

- Tipo novo: `type MainProposalTab = 'generate' | 'history'` em `ProposalsContainer`.
- Lazy mount: `{mainTab === 'history' && <HistoryTabContent ... />}` — quando desmonta, `useEffect` cleanup do hook cancela queries em voo.
- Para o lazy do hook: parametrizar `useProposalsStateWithFilter` com um flag `enabled: boolean` (similar ao React Query), default `false`; só dispara `fetchProposals` quando `enabled === true`.
- PDF de página única: usar `new jsPDF({ unit: 'mm', format: [210, computedHeightMm] })` quando aplicável.

## Não muda

- Integração com GPT/Vision (`AIImageProcessor`, edge function `analyze-image`).
- Lógica de extração CNPJ.
- Stepper Upload → Dados → Proposta dentro da aba "Gerar Proposta".
- Sidebar de opções (marca d'água, observações, executivo).
