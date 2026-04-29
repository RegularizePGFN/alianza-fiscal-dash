
# Modernização da Geração de Propostas

Objetivo: elevar o nível visual e a usabilidade da aba **Propostas** (upload → revisão de dados → proposta final → PDF), sem mexer na integração com o GPT (vision) nem na busca de CNPJ — ambas continuam funcionando exatamente como hoje.

## O que muda (visão geral)

1. Novo fluxo em **stepper** de 3 passos com progresso visual claro.
2. Tela de **upload** repaginada (drag & drop premium, preview lado a lado, status da IA com etapas).
3. Tela de **dados extraídos** com layout em duas colunas, badges de validação, busca de CNPJ inline e cartão da empresa elegante.
4. Tela de **proposta** com pré-visualização tipo "documento", painel lateral de opções (observações, executivo, vendedor, cores) e botão flutuante de download.
5. **PDF redesenhado**: layout A4 profissional, tipografia consistente, cabeçalho com logo + faixa de marca, blocos com hierarquia clara, tabela de parcelas, rodapé com dados do executivo/vendedor, marca d’água sutil e paginação.

## Telas

### Passo 1 — Upload (substitui `UploadTabContent`)
- Stepper no topo (1 Upload • 2 Dados • 3 Proposta) com estado ativo/concluído.
- Card grande com **drag & drop**, suporte a colar (Ctrl+V) e clique. Microcopy melhor, ícone animado.
- Após o envio: preview da imagem à esquerda, painel à direita com **etapas da IA** (enviando → analisando → extraindo → validando), barra de progresso e mensagens dinâmicas.
- Histórico e summary cards continuam abaixo, mas com cards mais limpos e tipografia consistente.

### Passo 2 — Dados Extraídos (substitui `DataTabContent`)
- Layout em duas colunas: à esquerda **Dados do Cliente / CNPJ** (com botão "Buscar CNPJ" inline), à direita **Dados Financeiros** (valor total, desconto, entrada, parcelas, honorários).
- Cada campo com label, helper, máscara e badge "Extraído por IA" quando vier do GPT, "Editado" quando alterado.
- Painel lateral mostra o cartão da empresa (`CompanyData`) assim que o CNPJ é resolvido.
- Botões "Voltar" e "Gerar Proposta" fixos no rodapé.

### Passo 3 — Proposta (substitui `ProposalTabContent`)
- Layout em duas colunas no desktop:
  - **Esquerda (≈70%)**: pré-visualização do documento (espelha o PDF final).
  - **Direita (≈30%)**: painel de opções em accordion — Observações, Dados do Executivo, Vendedor, Aparência (cor primária, mostrar/ocultar honorários parcelados, mostrar marca d'água).
- Barra superior com ações: **Editar dados**, **Baixar PDF**, **Baixar PNG**, **Nova proposta**.
- Edição inline (clicar num campo na pré-visualização abre popover de edição) — opcional, mantém também o modo "Editar dados" atual.

## PDF redesenhado (`src/lib/pdf/generatePdf.ts` + novo template React)

Em vez de capturar o card da tela com `html2canvas`, vamos renderizar um **template dedicado para PDF** (`ProposalPdfTemplate.tsx`) com largura fixa A4, tipografia e espaçamento pensados para impressão, e então gerar o PDF.

Estrutura do template:
```
┌─────────────────────────────────────────────────┐
│  [LOGO]   Aliança Fiscal                         │ ← faixa azul
│           Proposta de Regularização • PGFN       │
│                          Nº 0001 • 29/04/2026    │
├─────────────────────────────────────────────────┤
│  DADOS DO CONTRIBUINTE                           │
│  Razão Social ............ CNPJ ...........      │
│  Endereço .............................          │
│  Atividade principal ...........                 │
├─────────────────────────────────────────────────┤
│  RESUMO DA NEGOCIAÇÃO                            │
│  ┌──────────┬──────────┬──────────┐              │
│  │ Consol.  │ c/ Desc. │ Economia │              │
│  │ R$ X     │ R$ Y     │ R$ Z     │              │
│  └──────────┴──────────┴──────────┘              │
│  Desconto aplicado: 60%                          │
├─────────────────────────────────────────────────┤
│  OPÇÕES DE PAGAMENTO                             │
│  À Vista: R$ Y                                   │
│  Parcelado: entrada Nx + 60x de R$ ...           │
│  Tabela de vencimentos (resumida)                │
├─────────────────────────────────────────────────┤
│  HONORÁRIOS                                      │
│  À vista: R$ ...   |   Parcelado: ...x de R$ ... │
├─────────────────────────────────────────────────┤
│  OBSERVAÇÕES (se houver)                         │
├─────────────────────────────────────────────────┤
│  Especialista: Nome • email • telefone           │
│  Validade da proposta: até DD/MM/AAAA            │
└─────────────────────────────────────────────────┘
   Marca d'água sutil "Aliança Fiscal" no fundo
   Rodapé com paginação "1/2"
```

Decisões técnicas do PDF:
- Continua usando `html2canvas` + `jsPDF` (já no projeto), mas sobre o **template dedicado** renderizado fora da tela em 794px (A4 @96dpi), `scale: 3` para nitidez.
- Tipografia: Inter (já carregada) + tabular-nums em valores monetários.
- Paleta consistente com a marca (af-blue + af-green) e contraste ajustado para impressão.
- Quebra de página inteligente: cada bloco com `page-break-inside: avoid`.
- Nome do arquivo: `Proposta_PGFN_<RazaoSocial>_<DDMMAAAA>.pdf`.

## Mantém-se inalterado

- Integração com GPT/Vision (`analyzeImageWithAI`, edge function `analyze-image`).
- Busca de CNPJ (`fetchCnpjData`).
- Persistência no Supabase (`useSaveProposal`, `useFetchProposals`).
- Tipos `ExtractedData`, `Proposal`, `CompanyData`.
- Histórico, summary cards, filtros de data e dashboard de propostas.

## Arquivos afetados

Novos:
- `src/pages/proposals/components/ProposalsStepper.tsx`
- `src/components/proposals/upload/UploadDropzone.tsx` (redesign do FileUpload)
- `src/components/proposals/upload/AIProcessingPanel.tsx`
- `src/components/proposals/data-form/DataReviewLayout.tsx`
- `src/components/proposals/data-form/CompanyCard.tsx`
- `src/components/proposals/preview/ProposalPreviewLayout.tsx`
- `src/components/proposals/preview/OptionsSidebar.tsx`
- `src/components/proposals/pdf/ProposalPdfTemplate.tsx` (template dedicado para PDF)
- `src/components/proposals/pdf/sections/*` (Header, Negotiation, Payment, Fees, Footer)

Editados:
- `src/pages/proposals/ProposalsContainer.tsx` (stepper + layout)
- `src/pages/proposals/components/ProposalsTabs.tsx` (vira stepper, mantém estado)
- `src/pages/proposals/components/tabs/UploadTabContent.tsx`
- `src/pages/proposals/components/tabs/DataTabContent.tsx`
- `src/pages/proposals/components/tabs/ProposalTabContent.tsx`
- `src/lib/pdf/generatePdf.ts` (renderiza o novo template em vez do card da tela)
- `src/lib/pdf/generateSimplifiedPng.ts` (alinhar visual ao novo template)

Não editados (preservados): `src/lib/services/vision/*`, `src/lib/api.ts`, hooks de salvar/buscar propostas, schema do Supabase.

## Responsividade
- Stepper colapsa em ícones no mobile.
- Passo 2 e 3 viram coluna única < md.
- Pré-visualização da proposta abre em modal full-screen no mobile.

## Pontos a confirmar antes de implementar
1. Quer manter os **dois downloads** (PDF e PNG) ou só PDF?
2. Quer um **número sequencial de proposta** no cabeçalho do PDF (ex.: "Nº 0001") ou prefere apenas data?
3. Pode usar a marca d'água sutil "Aliança Fiscal" no fundo do PDF?
4. Mantemos a edição via "modo editar" atual + adicionamos edição inline na preview, ou substituímos pelo inline?

Posso seguir com defaults sensatos (PDF + PNG, sem número sequencial por enquanto, marca d'água ativada por opção, manter os dois modos de edição) caso prefira não responder agora.
