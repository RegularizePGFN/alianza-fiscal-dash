## Exibir PDFs gerados pela automação no detalhe do cadastro

Adicionar uma nova seção no `RegistrationDetailDrawer.tsx`, logo abaixo do `<AttachmentsField />` (linha 152) e antes do botão "Gerar proposta a partir do print".

### Componente novo: `AutomationFilesField.tsx`

Local: `src/components/registrations/AutomationFilesField.tsx`

- Recebe `registrationId: string` como prop.
- Usa o hook já existente `useAutomationFiles(registrationId)` (em `src/hooks/useAutomation.ts`) para listar os arquivos da tabela `client_registration_automation_files`.
- Se não houver arquivos, **não renderiza nada** (mantém UI limpa para cadastros sem automação).
- Quando houver arquivos:
  - Título: **"Relatório PGFN (gerado automaticamente)"** com ícone (ex.: `FileText`/`Sparkles`).
  - Lista cada arquivo como um card/linha mostrando: ícone PDF, `file_name`, data (`uploaded_at` formatada via `date-fns` pt-BR), e dois botões:
    - **Visualizar** (abre em nova aba) — usa `getAutomationFileUrl(file.id)` e `window.open(url, "_blank")`.
    - **Baixar** — usa `getAutomationFileBlob(file.id, file.file_name)`, cria object URL e dispara download com `<a download>`.
  - Estados de loading nos botões (`useState`) e `toast.error` em caso de falha.
- Estilo consistente com `AttachmentsField` (cards, espaçamento, classes Tailwind já usadas no projeto).

### Edição em `RegistrationDetailDrawer.tsx`

- Adicionar import do novo componente.
- Inserir `<AutomationFilesField registrationId={item.id} />` entre as linhas 156 e 158 (entre `AttachmentsField` e o botão "Gerar proposta").

### Sem mudanças necessárias em

- Banco / RLS (a tabela já tem políticas e o hook já funciona).
- Edge functions (`automation-file-url` já gera URL assinada e blob).
- `AttachmentsField` (continua mostrando só os prints manuais).

### Arquivos alterados

- `src/components/registrations/AutomationFilesField.tsx` (novo)
- `src/components/registrations/RegistrationDetailDrawer.tsx` (1 import + 1 linha de JSX)  
  
Implemente as duas alterações descritas:
  **1. Criar** `src/components/registrations/AutomationFilesField.tsx`**:**
  - Recebe `registrationId: string`
  - Usa `useAutomationFiles(registrationId)` para listar arquivos de `client_registration_automation_files`
  - Se sem arquivos, não renderiza nada
  - Com arquivos: título "Relatório PGFN (gerado automaticamente)" com ícone `FileText`, lista cada arquivo com ícone PDF, `file_name`, data formatada em pt-BR, botão "Visualizar" (`getAutomationFileUrl` + `window.open`) e botão "Baixar" (`getAutomationFileBlob` + `<a download>`)
  - Loading state nos botões, `toast.error` em falha
  - Estilo consistente com `AttachmentsField`
  **2. Editar** `src/components/registrations/RegistrationDetailDrawer.tsx`**:**
  - Adicionar import do `AutomationFilesField`
  - Inserir `<AutomationFilesField registrationId={item.id} />` entre o `<AttachmentsField />` e o botão "Gerar proposta a partir do print"