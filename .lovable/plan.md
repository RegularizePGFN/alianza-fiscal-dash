# Ajustes finos no Modelo 2 (Aliança)

Aplicar somente no template Modelo 2 — o Modelo 1 (Clássico) **não muda**.
Os ajustes precisam ser feitos em **dois lugares espelhados**:
- Preview React: `src/components/proposals/pdf/AliancaPdfTemplate.tsx`
- HTML do PDF: função `buildAliancaHtml` em `supabase/functions/generate-proposal-pdf/index.ts`

## 1. Mais respiro entre os blocos

Aumentar o espaçamento vertical para deixar a página mais arejada (sem perder o caráter "uma página A4"):

- Padding superior das seções: de `padding: '22px 40px 0'` → `padding: '30px 44px 0'`.
- Linha do tempo: `marginTop` das linhas de `10px` → `16px`; padding interno dos cards de timeline de `14px 18px` → `16px 20px`.
- Faixa de destaque (benefício/economia): padding de `22px 26px` → `26px 30px` e `margin-top` de `14px` → `18px` em relação ao bloco "Proposta para".
- Cards "Opções para a negociação": gap de `12px` → `16px`, padding de `14px 18px` → `18px 22px`.
- CTA final ("Pronto para regularizar?"): padding interno de `16px 22px` → `20px 26px`, com `margin-top` extra de `8px`.

## 2. Faixa degradê azul → verde abaixo do cabeçalho

Já existe a linha `<div style="height:4px; background: linear-gradient(90deg, BLUE 0%, GREEN 100%)" />` logo após o cabeçalho. Vamos:

- Mantê-la, mas mais espessa (`height: 6px`) e com `border-radius: 3px`.
- No PDF do edge function, garantir que a faixa apareça também (hoje o `buildAliancaHtml` precisa ter o mesmo elemento) e que ela fique colada na borda inferior de um cabeçalho mais "limpo" (sem o atual texto solto — só logo + título + datas).

## 3. Fonte Nunito em todo o Modelo 2

- Adicionar `Nunito` ao `<link>` do Google Fonts no HTML do PDF (ao lado dos pesos já carregados): `family=Nunito:wght@400;500;600;700;800`.
- Substituir `fontFamily: "'Inter', system-ui, ..."` por `fontFamily: "'Nunito', system-ui, -apple-system, sans-serif"` no contêiner raiz do `AliancaPdfTemplate` e no `body { font-family: ... }` do CSS do `buildAliancaHtml`.
- Modelo 1 continua com Inter / Playfair Display (não tocar).

## 4. Logomarca oficial no cabeçalho e rodapé

A logo oficial já está em `public/lovable-uploads/logo-alianca-fiscal.png` (mesma usada pelo Modelo 1). Hoje o Modelo 2 mostra um símbolo "A" + texto.

- Cabeçalho: trocar pelo `<img src="/lovable-uploads/logo-alianca-fiscal.png" />` (no edge function, usar o `logoUrl` em base64 que já vem do frontend — mesmo mecanismo do Modelo 1). Altura `40px`, sem o texto "ALIANÇA FISCAL · Consultoria Tributária" ao lado (a logo já contém isso).
- Rodapé: adicionar a mesma logo em versão pequena (altura `22px`, opacidade `0.85`) à esquerda do bloco "Aliança Fiscal · Especialista admin", substituindo o texto que faz esse papel hoje.

## 5. Entrada e Parcelas — usar a mesma leitura do Modelo 1

Bug atual: Modelo 2 mostra "Entrada R$ 0,00" e considera só `installments × installmentValue`. O Modelo 1 já lê corretamente os campos vindos da Regularize:
- `entryValue` (valor total da entrada)
- `entryInstallments` (em quantas vezes a entrada é cobrada)
- `installments` + `installmentValue` (parcelas restantes)
- Total real do parcelamento = `entryValue + installments × installmentValue`
- Número total de parcelas = `entryInstallments + installments`

Aplicar no Modelo 2 (preview React e HTML edge function), **sem alterar nenhuma lógica de extração**:

### a) Card "Parcelado" das "Opções para a Negociação"

Reescrever o card direito para mostrar **duas linhas**, espelhando o Modelo 1:

```
PARCELADO · {entryInstallments + installments}x no total
Entrada:   {entryInstallments}x de R$ {entryValue / entryInstallments}   (Total: R$ {entryValue})
Restantes: {installments}x de R$ {installmentValue}
```

Quando `entryInstallments === 1`, mostrar "Entrada: R$ {entryValue}" (linha única).
Quando `entryValue` for `0` ou ausente, omitir a linha de entrada e cair no comportamento atual (X parcelas iguais).

### b) Faixa de destaque (benefício)

A linha "Valor da dívida mantido R$ X · Nx de R$ Y" deve passar a usar o **total real**:
- "Valor da dívida mantido R$ {totalDebt} · {entryInstallments + installments}x"
- Em vez do `installmentValueLabel` único, mostrar: "entrada de {entryInstallments}x R$ {entryValue/entryInstallments} + {installments}x R$ {installmentValue}" (em uma única linha discreta).

### c) Linha do tempo de pagamentos

Hoje a timeline pula direto para "1ª parcela da negociação" no último dia útil do mês. Precisa refletir a entrada:
- Se `entryInstallments >= 1` e `entryValue > 0`: a 1ª linha após "Pague hoje (honorários)" passa a ser "Entrada da negociação ({entryInstallments}x de R$ X) — vence em {dueDate}".
- Em seguida, "1ª parcela restante" no último dia útil do mês seguinte, "2ª parcela restante" no mês seguinte, e "demais parcelas (3ª a Nª)" — mantendo o mesmo `getLastBusinessDayOfMonth`.

### d) Texto auxiliar no card "Parcelado"

Trocar "Entrada R$ 0,00 · 1ª parcela no último dia útil do mês" pelo texto correto baseado nos dados (ex.: "Entrada {entryInstallments}x · parcelas no último dia útil de cada mês").

## Validação

- Abrir uma proposta com entrada parcelada (5x) + 55 parcelas restantes e conferir:
  - Soma "entrada + restantes" = valor total da dívida (`totalDebt`).
  - Número total de linhas = `entryInstallments + installments`.
  - Modelo 1 e Modelo 2 mostram exatamente os mesmos números, mudando apenas a apresentação.
- Conferir visualmente: respiro maior, faixa degradê presente, fonte Nunito carregando, logo oficial no header e no footer.
- Re-deploy do edge function `generate-proposal-pdf` e gerar PDF para validar.

## Fora de escopo

- Lógica de extração de dados da Regularize.
- Modelo 1 (Clássico) — não mexer.
- Sidebar de opções, fluxo de download, autenticação Browserless.
