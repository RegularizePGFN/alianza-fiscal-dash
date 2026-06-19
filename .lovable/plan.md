## Objetivo

Receber e exibir os prints da simulação PGFN/SISPAR (PNG) enviados pela automação, além do status da simulação, separados dos PDFs já existentes.

## 1. Banco de dados (migration)

Adicionar colunas:

- `client_registrations.simulation_status TEXT` (sem default, nulo permitido).
- `client_registration_automation_files.file_type TEXT NOT NULL DEFAULT 'pdf'` com `CHECK (file_type IN ('pdf','screenshot'))`. Backfill: existentes ficam como `'pdf'`.

Recriar o índice único para considerar o tipo: `UNIQUE (registration_id, file_type, file_name)` (substituindo o atual `(registration_id, file_name)`), assim um PDF e um screenshot podem coexistir com o mesmo nome se necessário, e a deduplicação continua válida por tipo.

## 2. Edge function `automation-result`

Estender o payload do branch `status: "success"`:

- `simulation_status: "success" | "no_debts" | "error" | "pending"` (opcional).
- `screenshots: Array<{ name, content_base64 }>` (opcional, máx. mesmas regras de tamanho que `files`).

Mudanças no handler:

- Após o lock atômico, gravar `simulation_status` no update do `client_registrations` quando enviado.
- Loop adicional para `screenshots`, idêntico ao de `files`, mas:
  - bucket: mesmo `cadastro-automatico-pdfs` (continua privado).
  - `contentType: "image/png"`.
  - insert com `file_type: 'screenshot'`.
- Chatwoot: continuar enviando UMA nota privada só com os PDFs (screenshots não vão pro Chatwoot por enquanto, para não poluir).

## 3. Hook `useAutomation.ts`

- Adicionar `file_type` a `AutomationFile`.
- `useAutomationFiles` passa a aceitar opção `{ type?: 'pdf' | 'screenshot' }` (default `'pdf'`) e filtra via `.eq('file_type', type)`. Dedupe segue por `file_name` dentro do tipo.
- `getAutomationFileUrl` / `getAutomationFileBlob` permanecem (a edge function `automation-file-url` já entrega o arquivo bruto pelo `file_id`; só precisamos garantir que aceita qualquer tipo — já aceita, pois usa `file_path`).

## 4. UI — `RegistrationDetailDrawer`

Renomear/reaproveitar `AutomationFilesField` para tratar só PDFs (continua igual).

Criar novo componente `SimulationScreenshotsField` (mesmo diretório) renderizado logo abaixo, recebendo `registrationId` e `simulationStatus`:

- `simulationStatus == null` → não renderiza nada.
- `simulationStatus === 'success'`:
  - Carrega screenshots via `useAutomationFiles(id, { type: 'screenshot' })`.
  - Para cada screenshot, gera signed URL on-demand (igual ao fluxo de view atual via `getAutomationFileUrl`) e mostra como card-thumbnail em grid responsivo (`grid-cols-2 md:grid-cols-3`).
  - Clique no card abre a URL em nova aba (`window.open`).
  - Título da seção: "Prints da Simulação PGFN".
  - Se status `success` mas sem screenshots: mostra texto neutro "Nenhum print recebido".
- `simulationStatus === 'no_debts'`: badge amarelo (`bg-yellow-500/15 text-yellow-700 border-yellow-500/30`) — "Contribuinte sem dívidas negociáveis no SISPAR".
- `simulationStatus === 'error' | 'pending'`: badge cinza (`bg-muted text-muted-foreground`) — "Simulação pendente".

Para evitar N requests de signed URL no mount, criar pequeno helper que pede a URL ao clicar OU pré-carrega as URLs em paralelo dentro do componente (preferir pré-carregar, já que são no máx. 3 imagens).

No drawer, passar `item.simulation_status` ao novo componente, logo após `<AutomationFilesField />` na linha 159.

## 5. Validação

- Migration aprovada e tipos regenerados.
- Enviar payload de teste via curl com `simulation_status` e 1 screenshot base64 — confirmar linha em `client_registration_automation_files` com `file_type='screenshot'` e arquivo no bucket.
- Abrir o drawer de um cadastro com status `success` e prints — galeria deve aparecer e abrir em nova aba.
- Cadastro com `no_debts` mostra badge amarelo; antigo (null) não mostra nada.

## Detalhes técnicos

- A coluna `file_type` exige cleanup prévio? Não — todas as linhas atuais são PDFs, default cobre.
- Recriar índice único requer `DROP INDEX` do nome atual `client_registration_automation_files_reg_name_uniq` e `CREATE UNIQUE INDEX ... (registration_id, file_type, file_name)`.
- `automation-file-url` já resolve pelo `file_id`; nenhum ajuste necessário lá.
