## Objetivo

1. Permitir colar (Ctrl+V) imagens nos campos de print.
2. Criar perfil **Backoffice** com acesso operacional restrito.
3. Garantir visibilidade correta: Admin/Backoffice veem tudo; Vendedor só o próprio.

---

## 1. Ctrl+V de imagens

Aplicar suporte a colar imagens da área de transferência em três locais:

- **`AttachmentsField`** (modal de detalhe do cadastro) — adiciona à lista de prints existente.
- **`RegistrationFormModal`** (criar/editar cadastro) — novo bloco "Prints" que armazena arquivos em memória e faz upload junto ao salvar (hoje o modal não tem upload; vai ganhar um anexador idêntico ao do detalhe, criando o registro e depois subindo).
- **`AIImageProcessor`** (Propostas → Upload) — colar dispara o mesmo fluxo do "selecionar arquivo".

Implementação compartilhada:
- Novo hook `usePasteImage(onImage: (file: File) => void)` que escuta `paste` no `window` quando o componente está montado/visível, filtra `clipboardData.items` por `type.startsWith("image/")` e converte com `item.getAsFile()`.
- Indicador visual sutil ("Ctrl+V para colar") na área de upload.
- Toast de confirmação ao colar.

---

## 2. Perfil Backoffice

A role `backoffice` já existe no enum `UserRole` e no `UserFormModal`. Falta consolidar o que ela vê/faz.

**Sidebar (`AppSidebar.tsx`)** — para `role === 'backoffice'`:
- Mostrar: Dashboard (já existe, com visão de todos), Vendas (leitura), Propostas (leitura + editar status/prints), Cadastros (tudo), Perfil.
- Esconder: Inteligência Comercial, Usuários, Relatórios, Comissões, Inventário, Financeiro, Configurações, Meu Histórico.

**Guards de rota** — proteger páginas administrativas com checagem de role, redirecionando backoffice para `/cadastros` se acessar rota não permitida.

**Cadastros**:
- Já é permitido pelas RLS atuais (`backoffice` em `client_registrations` e `client_registration_attachments`).
- No `RegistrationsContainer`, garantir que o filtro "ver todos" se aplique para backoffice (hoje só admin).
- Botões de excluir cadastro: continuar restrito a admin (conforme decisão anterior).

**Propostas (somente leitura + status/prints)**:
- Nova policy SELECT em `proposals` para `backoffice` ver tudo.
- Nova policy UPDATE em `proposals` restrita a `backoffice`, mas apenas em colunas `status` e `image_url` — implementado via trigger `BEFORE UPDATE` que aborta se backoffice tentar alterar qualquer outra coluna (Postgres não permite RLS por coluna em UPDATE de forma simples).
- Sem INSERT/DELETE para backoffice.
- Frontend: na lista/detalhe de propostas, desabilitar edição de campos do cliente quando `user.role === 'backoffice'`, mantendo habilitados apenas troca de status e upload de print.

**Vendas (somente leitura)**:
- Nova policy SELECT em `sales` para `backoffice`.
- Sem INSERT/UPDATE/DELETE.
- Frontend: ocultar botões de criar/editar/excluir.

---

## 3. Visibilidade dos cadastros

Já correto no banco (`Salesperson view own registrations` + `Backoffice/Admin manage all`). Auditar:
- `useRegistrations` não força filtro extra por `salesperson_id` — a RLS é quem decide. OK.
- Container/Table: chips de filtro "Meus / Todos" só aparecem para admin/backoffice.

---

## Detalhes técnicos

### Migration (proposals)

```sql
-- SELECT para backoffice
CREATE POLICY "Backoffice can view all proposals"
ON public.proposals FOR SELECT
USING (get_current_user_role() = 'backoffice');

-- UPDATE para backoffice (limitado via trigger)
CREATE POLICY "Backoffice can update proposals"
ON public.proposals FOR UPDATE
USING (get_current_user_role() = 'backoffice');

CREATE OR REPLACE FUNCTION public.restrict_backoffice_proposal_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF get_current_user_role() = 'backoffice' THEN
    IF NEW.client_name IS DISTINCT FROM OLD.client_name
       OR NEW.cnpj IS DISTINCT FROM OLD.cnpj
       OR NEW.client_phone IS DISTINCT FROM OLD.client_phone
       OR NEW.client_email IS DISTINCT FROM OLD.client_email
       OR NEW.total_debt IS DISTINCT FROM OLD.total_debt
       OR NEW.debt_number IS DISTINCT FROM OLD.debt_number
       OR NEW.discounted_value IS DISTINCT FROM OLD.discounted_value
       OR NEW.discount_percentage IS DISTINCT FROM OLD.discount_percentage
       OR NEW.entry_value IS DISTINCT FROM OLD.entry_value
       OR NEW.installments IS DISTINCT FROM OLD.installments
       OR NEW.installment_value IS DISTINCT FROM OLD.installment_value
       OR NEW.fees_value IS DISTINCT FROM OLD.fees_value
       OR NEW.business_activity IS DISTINCT FROM OLD.business_activity
       OR NEW.user_id IS DISTINCT FROM OLD.user_id THEN
      RAISE EXCEPTION 'Backoffice pode alterar apenas status e print da proposta';
    END IF;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER restrict_backoffice_proposal_update_trg
BEFORE UPDATE ON public.proposals
FOR EACH ROW EXECUTE FUNCTION public.restrict_backoffice_proposal_update();
```

### Migration (sales)

```sql
CREATE POLICY "Backoffice can view all sales"
ON public.sales FOR SELECT
USING (get_current_user_role() = 'backoffice');
```

### Arquivos a alterar

- `src/hooks/usePasteImage.ts` (novo)
- `src/components/registrations/AttachmentsField.tsx`
- `src/components/registrations/RegistrationFormModal.tsx`
- `src/components/proposals/AIImageProcessor.tsx`
- `src/components/layout/AppSidebar.tsx`
- `src/components/registrations/RegistrationsContainer.tsx` (chips "Meus/Todos" + isAdmin || isBackoffice)
- Guards nas páginas administrativas (criar `RoleGuard` simples ou checar em cada page)
- Propostas: desabilitar campos para backoffice no formulário de edição
- Vendas: ocultar ações para backoffice
