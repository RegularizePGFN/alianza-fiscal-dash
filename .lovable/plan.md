# Novas regras de honorários (sugestão automática)

Atualizar o cálculo automático do campo "Valor dos Honorários (à vista)" em **todas as propostas** (não só as vindas do cadastro), mantendo o campo editável.

## Regras

Seja `D` = Valor Total da Dívida e `V` = Valor com Desconto.

1. **Piso absoluto:** o honorário sugerido nunca pode ser menor que **R$ 179,90**.
2. **Com desconto** (`V < D`, ou seja, houve desconto real):
   - Honorário = **30% × (D − V)**
   - Se resultado < 179,90 → usar **179,90**
3. **Sem desconto** (`V == D`, `V` vazio ou desconto = 0):
   - Honorário = **15% × D**
   - Se resultado < 179,90 → usar **179,90**
4. O valor é apenas **sugestão**: o usuário continua podendo editar livremente o campo `feesValue` (e os cálculos de parcelamento de honorários — 20% acima, divisão por parcelas — continuam funcionando a partir do valor atual do campo).

## Onde mudar

Arquivo único: `src/hooks/proposals/useFeesCalculation.tsx`

- Reescrever `calculateFees()` para implementar as 3 regras acima.
- Ajustar o `useEffect` que dispara o cálculo: hoje só roda quando `totalDebt` **e** `discountedValue` existem. Passar a rodar sempre que `totalDebt` mudar (com ou sem `discountedValue`), para cobrir o caso "sem desconto".
- Manter a constante `MIN_FEES = 179.90` no topo do arquivo.
- Não mexer no recálculo de parcelas de honorários (`calculateInstallmentFeesTotal` / `calculateInstallmentValue`) — eles continuam derivando do `feesValue` final.

## Não muda

- UI dos campos de honorários (continuam editáveis).
- Schema, edge functions, geração de PDF.
- Fluxo de handoff Cadastro → Proposta.
