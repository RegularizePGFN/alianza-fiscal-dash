## Rotacionar `CHATWOOT_WEBHOOK_SECRET`

### Passos
1. Disparar `update_secret` para `CHATWOOT_WEBHOOK_SECRET` com o valor fornecido:
   `bab34cdf62faee175131963ce0a3321886f402b5b64b998a3295d5072a59ca25`
2. Devolver a URL pronta pra colar no Chatwoot:
   ```
   https://sbxltdbnqixucjoognfj.supabase.co/functions/v1/chatwoot-novo-lead?secret=bab34cdf62faee175131963ce0a3321886f402b5b64b998a3295d5072a59ca25
   ```
3. Confirmar que esse mesmo valor continua valendo para o header `x-webhook-secret` usado pela `chatwoot-test-connection` — ambas as funções leem o mesmo env var `CHATWOOT_WEBHOOK_SECRET` no runtime, então a rotação atualiza os dois caminhos simultaneamente, sem mudança de código.

### Observações
- Nenhum arquivo de código será alterado.
- O Edge Runtime recarrega o secret em segundos após o `update_secret`.
- Recomendo apagar o valor do secret desta conversa depois que ele estiver registrado no Chatwoot.