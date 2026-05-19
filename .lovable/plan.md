## Problema

Hoje, ao clicar em **"Gerar proposta a partir do print"** no drawer de Cadastros:

- A rota muda para `/propostas?cadastroId=...` e o handoff em `ProposalsContainer.tsx` **já força a aba `data` (Passo 2)** antes de qualquer coisa renderizar — a tela fica "em branco" porque o formulário de dados aparece vazio enquanto a IA ainda processa em segundo plano.
- O print não é exibido no Passo 1 (Upload), então o usuário não vê a imagem nem o progresso da extração.
- Quando a IA termina, `handleProcessComplete` faz `setFormData({...prev, ...extractedData})` — como o print normalmente **não tem CNPJ**, o `extractedData.cnpj` vem vazio/undefined e acaba sobrescrevendo ou simplesmente não preservando o CNPJ que viera do cadastro.

## Solução

Reescrever apenas o handoff em `src/pages/proposals/ProposalsContainer.tsx` para:

1. **Ir para Passo 1 (`upload`) imediatamente**, já mostrando o print do cadastro como preview e a barra de progresso da IA — usando o estado `processing` / `progressPercent` que o `UploadTabContent` já consome.
2. **Buscar o cadastro + primeiro anexo**, converter para base64 e **setar `imagePreview`** antes de iniciar a análise (para o usuário ver o print enquanto a IA roda).
3. Rodar `analyzeImageWithAI` no mesmo fluxo atual.
4. Quando a extração terminar, chamar `handlers.handleProcessComplete(extracted, base64)` (que avança para Passo 2) e, **logo depois**, fazer um merge final que **garante** que o CNPJ / nome / telefone / email do cadastro sobrescrevam o que a IA possa ter deixado vazio:
   ```ts
   proposalsState.setFormData((prev) => ({
     ...prev,
     cnpj: reg.cnpj || prev.cnpj,
     clientName: reg.client_name || prev.clientName,
     clientPhone: reg.client_phone || prev.clientPhone,
     clientEmail: reg.client_email || prev.clientEmail,
   }));
   ```
   Assim o Passo 2 abre com o **CNPJ do cadastro já preenchido** (resolvendo a obrigatoriedade do segundo print) e dispara automaticamente a busca de empresa via `useFetchCompanyData` (que já reage a mudança de CNPJ e preenche Razão Social / Atividade Principal).
5. Caso o cadastro **não tenha anexo**, mantém o comportamento atual de mostrar toast e deixar o usuário no Passo 1 — mas já com o CNPJ pré-preenchido para quando ele subir o print manualmente.
6. Manter o guard `handoffDone.current` e o `setSearchParams({}, { replace: true })` no `finally` para não reprocessar em re-renders.

## Fluxo esperado após a correção

```text
[Cadastros]  → click "Gerar proposta a partir do print"
        ↓
[Propostas /?cadastroId=...]
   Passo 1 (Upload) ─ print exibido + barra de progresso da IA
        ↓ (extração concluída)
   Passo 2 (Dados Extraídos) ─ CNPJ do cadastro + dados financeiros do print
        ↓
   Passo 3 (Proposta)
```

## Arquivos afetados

- `src/pages/proposals/ProposalsContainer.tsx` — único arquivo alterado. Sem mudanças em hooks, schema ou edge functions.

## Fora de escopo

- Não mexer no `handleProcessComplete` global (outros fluxos de upload manual dependem dele).
- Não alterar a tabela `client_registrations` nem a estrutura de anexos.
- Não tocar em sidebar / roles (já corrigidos na rodada anterior).
