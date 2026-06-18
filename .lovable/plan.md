## Problema

Na página `/cadastros`, o filtro de busca compara o texto digitado com os campos como string. O CNPJ é salvo só com dígitos (ex.: `37276064000120`), então:

- Digitar `37276064000120` → encontra
- Digitar `37.276.064/0001-20` → não encontra (a máscara não está armazenada)

O mesmo vale para CPF e telefone.

## Correção

Em `src/components/registrations/RegistrationsContainer.tsx`, no `useMemo` que calcula `filtered` (linhas ~78–92):

1. Se o termo digitado contém só dígitos/pontuação típica de documento, criar uma versão "só dígitos" tanto do termo quanto dos campos `cnpj`, `cpf` e `client_phone` e comparar com `includes`.
2. Manter a comparação textual atual para `client_name` e `salesperson_name`.
3. Um cadastro entra no resultado se bater em qualquer uma das duas comparações.

Resumo da lógica:
```text
qDigits = só dígitos do termo
matchDigits = qDigits && (cnpjDigits | cpfDigits | phoneDigits).includes(qDigits)
matchText   = termo.toLowerCase() em (client_name | salesperson_name | cnpj | cpf | phone)
return matchDigits || matchText
```

Sem mudanças no banco, RLS, edge functions ou outros arquivos.
