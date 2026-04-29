## Parte 1 — Validade editável na proposta

Hoje a validade é calculada automaticamente (24h após criação, via trigger no banco) e o campo na DataForm está `disabled`. Vamos torná-la editável e refletir essa data na prévia e no PDF final.

**Fluxo:**
1. **DataForm** (`src/components/proposals/DataForm.tsx`): substituir o `<Input disabled>` da Data de Validade por um date picker (Popover + Calendar shadcn). Valor inicial = `formData.validityDate` ou `creationDate + 24h`. Ao mudar, atualiza `formData.validityDate` no formato ISO/yyyy-MM-dd.
2. **Prévia** (`MetadataSection.tsx` + `ProposalHeader.tsx` que mostra "Emissão/Validade"): já recebem `validityDate` via `data` — passarão a refletir o valor escolhido automaticamente. Adicionar também um botão de edição inline (ícone calendário) no cabeçalho da prévia que abre o mesmo date picker e atualiza o estado da proposta.
3. **Persistência** (`useSaveProposal.ts`): incluir `validity_date` no payload do `insert/update` quando o usuário definir manualmente, sobrescrevendo o cálculo do trigger. O trigger continua para o caso default.
4. **PDF** (`supabase/functions/generate-proposal-pdf/index.ts` + `ProposalPdfTemplate.tsx`): o template já consome `validityDate` de `data` — basta garantir que o valor escolhido seja propagado no payload enviado ao Browserless. Sem mudanças visuais no PDF.

## Parte 2 — Diálogo "Propostas Geradas" com seletor de data/intervalo

**Arquivos:** `useTodayProposals.ts`, `TodayProposalsDialog.tsx`, `TodayProposalsTable.tsx`, `exportTodayProposals.ts`.

1. **Renomear título** de "Propostas Geradas Hoje" → **"Propostas Geradas"**.
2. **Hook `useTodayProposals`**: aceitar `{ from: Date; to: Date }` como parâmetro (default = hoje 00:00 → hoje 24:00). Usar essas datas no `gte`/`lt` do query do Supabase. Incluir `client_phone` no `select` e no tipo `TodayProposal`.
3. **Dialog**: adicionar um seletor de data com 3 modos (igual ao `ProposalsDateFilter` já existente):
   - "Hoje" (padrão)
   - "Últimos 7 dias"
   - "Período personalizado" (Popover com Calendar `mode="range"`)
   
   O badge atual com `todayLabel` passa a mostrar o range selecionado (ex.: "01/04 – 29/04"). A lista, gráficos e exportação respeitam o range escolhido (já usam `proposals` derivado do hook).
4. **Tabela**: adicionar coluna "Telefone" (formato `(XX) XXXXX-XXXX`), opcional/colapsada em telas pequenas.
5. **Exportação Excel** (`exportTodayProposals.ts`):
   - Adicionar coluna **"Telefone"** entre Cliente e CNPJ.
   - Nome do arquivo passa a refletir o range: `propostas-{yyyy-MM-dd}_a_{yyyy-MM-dd}.xlsx` (ou `propostas-{data}.xlsx` para um único dia).
   - Garantir que a exportação use o array `proposals` já filtrado pelo range + filtros atuais (vendedor/desconto).

## Detalhes técnicos

- O telefone do cliente **já é salvo** na coluna `proposals.client_phone` (confirmado em `useSaveProposal.ts` e na busca de CNPJ). Sem migrações necessárias.
- A coluna `validity_date` já existe na tabela `proposals` e o trigger `set_proposal_validity_date` define o default. Como o trigger usa `BEFORE INSERT` e atribui sempre `creation_date + 24h`, ele **sobrescreve** valor enviado pelo cliente. Precisamos ajustar o trigger para só preencher quando `validity_date IS NULL` — vai ser uma migration mínima:
  ```sql
  CREATE OR REPLACE FUNCTION public.set_proposal_validity_date()
  RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
  BEGIN
    IF NEW.validity_date IS NULL THEN
      NEW.validity_date := NEW.creation_date + interval '24 hours';
    END IF;
    RETURN NEW;
  END;
  $$;
  ```
- Date picker: usar `Calendar` do shadcn com `className="p-3 pointer-events-auto"` dentro de Popover (padrão do projeto, ver `ProposalsDateFilter.tsx`).
- Sem alterações no design do PDF — mantemos o layout aprovado.

## Resumo de arquivos

- Editar: `src/components/proposals/DataForm.tsx`, `src/components/proposals/card/sections/MetadataSection.tsx` (ou ProposalHeader, conforme onde aparece "Emissão/Validade"), `src/hooks/proposals/useSaveProposal.ts`, `src/components/dashboard/today-proposals/{useTodayProposals.ts,TodayProposalsDialog.tsx,TodayProposalsTable.tsx,exportTodayProposals.ts}`.
- Migration: ajuste do trigger `set_proposal_validity_date`.
- Sem mudanças no PDF/edge function.
