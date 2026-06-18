Diagnóstico encontrado:

- A duplicação não é só visual: existem múltiplos registros repetidos em `client_registration_automation_files` para o mesmo `registration_id + file_name`.
- Exemplo do print: o cadastro `aee6a609-4e39-49cd-8904-30f651b5d32e`, conversa `63647`, tem 5 arquivos iguais salvos com o mesmo nome, todos em segundos próximos — por isso foram enviadas 5 mensagens no Chatwoot.
- A correção anterior era vulnerável a corrida: várias chamadas simultâneas da `automation-result` leem “não existe arquivo ainda” ao mesmo tempo e todas fazem upload/envio antes de uma delas finalizar. O `automation_status` também só vira `success` no final, então não bloqueia chamadas concorrentes.

Plano de correção:

1. **Travar o processamento no início da `automation-result`**
   - Assim que receber `success`, atualizar atomicamente o cadastro de `processing` para um estado temporário tipo `finalizing`.
   - Se outra chamada chegar ao mesmo tempo, ela não conseguirá assumir o cadastro e retornará como duplicada/ignorada, sem enviar mensagem ao Chatwoot.

2. **Adicionar proteção real no banco contra arquivos duplicados**
   - Criar índice único em `client_registration_automation_files(registration_id, file_name)`.
   - Antes disso, limpar duplicados existentes mantendo apenas o arquivo mais antigo por `registration_id + file_name`.
   - Isso impede que qualquer função, retry ou corrida grave o mesmo PDF várias vezes novamente.

3. **Ajustar a inserção do arquivo para ser idempotente**
   - Trocar o fluxo atual por inserção com tratamento de duplicidade.
   - Só enviar ao Chatwoot os arquivos que foram realmente inseridos nesta chamada.
   - Se o arquivo já existir, não faz upload novo e não cria mensagem privada.

4. **Enviar uma única nota por resultado**
   - Em vez de uma mensagem por arquivo, montar uma única mensagem privada com o texto “Relatório de dívidas gerado com sucesso. Segue em anexo.” e anexar todos os PDFs não duplicados em `attachments[]`.
   - No caso comum de um único PDF, isso garante exatamente uma mensagem.

5. **Validar com dados reais**
   - Conferir depois da alteração se não há novos duplicados por `registration_id + file_name`.
   - Consultar logs da `automation-result` para confirmar que chamadas concorrentes estão sendo ignoradas antes de enviar ao Chatwoot.