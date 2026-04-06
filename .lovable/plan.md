

## Plano: Corrigir Erro de RLS ao Salvar Propostas

### Problema
O trigger `prevent_duplicate_proposals` tenta deletar propostas duplicadas antes de inserir uma nova. Como a política de DELETE na tabela `proposals` só permite admins, vendedores recebem o erro "new row violates row-level security policy".

### Solução

Alterar o trigger `prevent_duplicate_proposals` para usar `SECURITY DEFINER`, permitindo que ele execute a deleção de duplicatas com privilégios elevados independentemente do role do usuário.

### Migration SQL

```sql
CREATE OR REPLACE FUNCTION public.prevent_duplicate_proposals()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    IF NEW.cnpj IS NOT NULL AND NEW.total_debt IS NOT NULL THEN
        DELETE FROM proposals 
        WHERE cnpj = NEW.cnpj 
          AND total_debt = NEW.total_debt
          AND id != COALESCE(NEW.id, gen_random_uuid());
        
        IF FOUND THEN
            RAISE NOTICE 'Removed existing proposal(s) for CNPJ % with total_debt %', NEW.cnpj, NEW.total_debt;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$function$;
```

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| Nova migration SQL | Adicionar `SECURITY DEFINER` ao trigger `prevent_duplicate_proposals` |

### Resultado Esperado
Vendedores poderão salvar propostas normalmente, mesmo quando já existe uma proposta com o mesmo CNPJ e valor de dívida.

