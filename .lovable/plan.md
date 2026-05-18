# Módulo Cadastros (Regularize)

Substitui a planilha do Google Sheets por um módulo nativo, com histórico, prints da simulação PGFN, métricas de tempo de atendimento e atalho direto para gerar a proposta a partir do print.

## Quem usa e o que vê

- **Vendedor**: cria cadastros para seus clientes, vê e edita apenas os seus, acompanha situação.
- **Backoffice / Admin**: vê todos os cadastros, atende (marca como Realizado/Pendente/Cancelado), anexa o print da simulação PGFN e adiciona observações.
- **Admin**: tudo acima + acesso aos dashboards e exportação.

> Hoje só existem os papéis `admin`, `gestor` e `vendedor`. Vou adicionar o papel **`backoffice`** (não vê preço/comissão, só o módulo Cadastros + perfil). Se preferir que o backoffice continue sendo apenas usuários admin, me diga.

## Localização no sistema

- Sidebar → grupo **Comercial**, logo abaixo de *Propostas*: **Cadastros** (ícone `ClipboardList`).
- Rota: `/cadastros`.
- Visível para todos os papéis logados.

## Tela principal

Lista em formato de tabela (estilo Vendas/Propostas) + KPIs no topo:

**KPIs**
- Cadastros do mês
- Aguardando atendimento
- Realizados hoje
- Tempo médio de atendimento (criação → realizado)

**Filtros**
- Período (hoje, 7d, 30d, mês, custom)
- Situação (Aguardando, Pendente, Realizado, Cancelado)
- Motivo
- Vendedor (admin/backoffice)
- Backoffice responsável (admin)
- Busca por nome/CNPJ/CPF/telefone

**Colunas da tabela**
Vendedor • Telefone • CNPJ • CPF • Motivo • Situação (chip colorido) • Backoffice • Criado em • Atendido em • Observação • Ações.

**Ações por linha**
- Editar
- Anexar prints (backoffice/admin)
- **Gerar Simulação** → abre `/propostas` já na aba *Dados* com o primeiro print carregado e os campos cliente (CNPJ, nome, telefone) pré-preenchidos a partir do cadastro
- Ver histórico (timeline de mudanças de situação)
- Excluir (admin)

## Formulário de cadastro

Criação (vendedor):
- Nome do cliente
- Telefone (com máscara BR)
- CNPJ e/ou CPF (pelo menos um obrigatório)
- Motivo: *Fazer cadastro*, *Alterar cadastro*, *Receita Federal*, *Cancelar acesso* (editável depois nas Configurações)
- Observação (texto livre)

Atendimento (backoffice):
- Mudar situação (Aguardando → Pendente/Realizado/Cancelado)
- Upload de prints (múltiplos) — bucket `cadastro-prints`
- Observação interna

Quando situação vira **Realizado**, grava `completed_at` e `completed_by` automaticamente.

## Integração com Propostas (Gerar Simulação)

Botão "Gerar Simulação" na linha do cadastro:
1. Pega o primeiro print anexado (ou abre seletor se houver vários).
2. Navega para `/propostas?cadastroId=<id>`.
3. A página de Propostas detecta o param, baixa a imagem do storage, joga direto no `useImageProcessor` (mesmo fluxo do upload manual) e pula a etapa de drag-and-drop.
4. Cliente (CNPJ/nome/telefone) já vai pré-preenchido.

## Dashboards (aba "Análise" dentro de Cadastros)

- Cadastros por dia (linha)
- Distribuição por Motivo (pizza)
- Distribuição por Situação (barras)
- Ranking de backoffice (volume atendido + tempo médio)
- Tempo médio de atendimento por vendedor
- Funil: Criados → Em atendimento → Realizados → Cancelados

Exportação para Excel com paginação em lote (mesmo padrão do Relatório de Vendas, sem o limite de 1000).

## Histórico / auditoria

Tabela `cadastro_events` registra cada mudança de situação (quem, quando, de/para, observação). Exibido em timeline no modal de detalhe.

---

## Detalhes técnicos

**Tabelas novas**
- `client_registrations`: `id`, `salesperson_id`, `salesperson_name`, `client_name`, `client_phone`, `cnpj`, `cpf`, `reason` (enum: `fazer_cadastro` | `alterar_cadastro` | `receita_federal` | `cancelar_acesso`), `status` (enum: `aguardando` | `pendente` | `realizado` | `cancelado`), `notes`, `backoffice_id`, `backoffice_name`, `completed_at`, `created_at`, `updated_at`.
- `client_registration_attachments`: `id`, `registration_id`, `file_url`, `uploaded_by`, `uploaded_at`.
- `client_registration_events`: `id`, `registration_id`, `from_status`, `to_status`, `changed_by`, `changed_by_name`, `note`, `created_at`.

**RLS**
- Vendedor: SELECT/INSERT/UPDATE apenas onde `salesperson_id = auth.uid()` e enquanto status = `aguardando`.
- Backoffice/Admin: ALL.
- Anexos e eventos seguem o acesso do cadastro pai.

**Storage**
- Novo bucket público `cadastro-prints` (mesmo padrão de `equipment-photos`), policies: leitura pública, upload/delete para backoffice/admin e para o vendedor dono enquanto o cadastro estiver `aguardando`.

**Papel `backoffice`**
- Adicionar à coluna `role` em `profiles` (texto livre hoje, sem CHECK).
- Atualizar `UserRole` enum no frontend (`src/lib/types.ts`) e o UserFormModal.
- `AppSidebar`: backoffice vê só *Cadastros* + *Perfil* (e Dashboard se fizer sentido).

**RPC para métricas**
- `get_registrations_summary(p_start, p_end)` SECURITY DEFINER, devolvendo totais, tempo médio, breakdown por motivo/status/backoffice — bypass do limite de 1000 (padrão já usado no projeto).

**Frontend (estrutura)**
```
src/pages/RegistrationsPage.tsx
src/components/registrations/
  RegistrationsContainer.tsx
  RegistrationsKpiCards.tsx
  RegistrationsFilters.tsx
  RegistrationsTable.tsx
  RegistrationFormModal.tsx
  RegistrationDetailDrawer.tsx   (anexos + timeline + ações)
  AttachmentsField.tsx
  RegistrationsCharts.tsx
  exportRegistrations.ts
src/hooks/useRegistrations.ts
src/hooks/useRegistrationMetrics.ts
```

Em Propostas: pequeno hook que lê `searchParams.get("cadastroId")`, baixa o anexo via Supabase Storage e injeta no fluxo de processamento existente.

---

## Perguntas rápidas antes de implementar

1. **Papel backoffice**: crio um papel novo `backoffice`, ou o backoffice continua sendo usuário `admin`?
2. **Lista de motivos**: confirmo *Fazer cadastro / Alterar cadastro / Receita Federal / Cancelar acesso* — quer mais algum?
3. **Vendedor pode editar depois de criado?** Sugiro permitir editar/excluir apenas enquanto status = `aguardando`. Ok?
4. **Backoffice escolhe quem atende ou é automático** (quem marcar Realizado vira o responsável)? Sugiro automático.