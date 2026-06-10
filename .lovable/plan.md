Vou ajustar a edge function `generate-proposal-pdf` para diagnosticar corretamente o erro atual e evitar que tudo apareça apenas como “token inválido”.

Plano:
1. Atualizar o tratamento de erro do Browserless para registrar um trecho seguro da resposta real quando der 401/403/429, sem expor o token.
2. Melhorar a normalização do `BROWSERLESS_TOKEN`, removendo espaços/quebras acidentais e, se alguém colar uma URL completa com `?token=`, extrair só o valor do token.
3. Manter o endpoint oficial atual `https://production-sfo.browserless.io/pdf?token=...`, que a documentação confirma estar correto.
4. Implantar a edge function e testar de novo pelos logs para confirmar se o problema ainda é autenticação, cota, região/endpoint, ou payload.

Detalhe técnico: hoje o código já chama o endpoint correto, e o log mais recente ainda retorna 401. A mudança principal é deixar a função tolerante a token colado em formatos diferentes e mostrar a causa real retornada pelo Browserless.