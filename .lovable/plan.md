## Controle de Equipamentos da Empresa

Novo módulo administrativo para cadastrar e gerenciar os equipamentos da empresa (notebooks, celulares, monitores, etc.) e atribuí-los a colaboradores.

### Onde fica
- Novo item no menu lateral, **grupo "Administrativo"**, visível **apenas para admins**, com ícone `Laptop` e label **"Equipamentos"**.
- Rota: `/equipamentos`.

### O que dá pra fazer

**1. Cadastro de equipamentos**
Cada equipamento tem:
- Nome / identificação (ex.: "Notebook Dell Inspiron 15")
- Tipo (Notebook, Celular, Monitor, Headset, Tablet, Outros) — selecionável
- Marca e modelo
- Número de série / IMEI (opcional)
- Tag / patrimônio interno (opcional, gerada automaticamente se vazia: EQ-0001, EQ-0002…)
- Data de aquisição
- Valor de aquisição (opcional)
- Condição (Novo, Bom, Regular, Danificado)
- Status (Disponível, Em uso, Em manutenção, Aposentado) — calculado automaticamente conforme atribuições ativas, mas com override manual para manutenção/aposentado
- Observações (texto livre)

**2. Atribuições (histórico)**
Cada equipamento mantém um histórico de quem usou:
- Colaborador atribuído (dropdown com usuários do sistema)
- Data de entrega
- Data de devolução (opcional — fica em branco enquanto está com a pessoa)
- Condição na entrega / na devolução (opcional)
- Observações da atribuição

Um equipamento só pode ter **uma atribuição ativa** (sem data de devolução) por vez. Ao atribuir a outra pessoa enquanto há uma ativa, o sistema sugere encerrar a anterior automaticamente.

**3. Tela principal (lista)**
- Cards de KPI no topo: Total de equipamentos, Em uso, Disponíveis, Em manutenção
- Filtros: busca por nome/serial/tag, filtro por tipo, por status, por colaborador
- Tabela com: Tag, Nome, Tipo, Status (badge colorido), Em uso por (nome do colaborador atual ou "—"), Desde (data da atribuição ativa), Ações
- Botão "Novo Equipamento" no header

**4. Detalhe do equipamento (dialog)**
- Aba "Informações" — todos os dados cadastrais (editáveis)
- Aba "Atribuições" — histórico completo em timeline, com botão "Nova atribuição" e "Registrar devolução" para a ativa

### Detalhes técnicos

**Migration (nova) — duas tabelas + RLS admin-only:**

```sql
create table public.equipment (
  id uuid primary key default gen_random_uuid(),
  tag text unique not null,             -- EQ-0001 (gerado por trigger se vazio)
  name text not null,
  type text not null,                   -- notebook|celular|monitor|headset|tablet|outros
  brand text, model text,
  serial_number text, imei text,
  acquisition_date date,
  acquisition_value numeric,
  condition text default 'bom',         -- novo|bom|regular|danificado
  status text default 'disponivel',     -- disponivel|em_uso|manutencao|aposentado
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.equipment_assignments (
  id uuid primary key default gen_random_uuid(),
  equipment_id uuid not null references equipment(id) on delete cascade,
  user_id uuid not null,                -- profile do colaborador
  user_name text not null,              -- snapshot
  assigned_at date not null default current_date,
  returned_at date,                     -- null = ativa
  condition_on_assign text,
  condition_on_return text,
  notes text,
  created_at timestamptz default now()
);

create index on equipment_assignments(equipment_id, returned_at);
```

- **RLS:** ambas as tabelas com policy `ALL` restrita a `get_current_user_role() = 'admin'`.
- **Trigger** `set_equipment_tag`: gera `EQ-XXXX` sequencial se `tag` vier vazia.
- **Trigger** `sync_equipment_status`: ao inserir atribuição ativa → status `em_uso`; ao encerrar última ativa → `disponivel` (respeita override `manutencao`/`aposentado`).
- **Trigger** `updated_at` reusando `update_updated_at_column()`.

**Frontend:**
- `src/pages/EquipmentPage.tsx` — guard de admin (igual ao `UsersPage`)
- `src/components/equipment/`
  - `EquipmentContainer.tsx` (KPIs + filtros + tabela)
  - `EquipmentKpiCards.tsx`
  - `EquipmentFilters.tsx`
  - `EquipmentTable.tsx`
  - `EquipmentFormModal.tsx` (criar/editar)
  - `EquipmentDetailDialog.tsx` (abas Informações + Atribuições)
  - `AssignmentForm.tsx` / `AssignmentTimeline.tsx`
- `src/hooks/useEquipment.ts` — React Query: `useEquipmentList`, `useEquipmentDetail`, `useSaveEquipment`, `useDeleteEquipment`, `useAssignments`, `useCreateAssignment`, `useReturnAssignment`
- `src/App.tsx` — rota `/equipamentos`
- `src/components/layout/AppSidebar.tsx` — link novo no grupo Administrativo (ícone `Laptop`, admin-only)

### O que NÃO entra nesta primeira versão
- Upload de foto / nota fiscal do equipamento (pode vir depois)
- Cálculo de depreciação contábil
- Alertas automáticos de manutenção preventiva
- Exportação CSV/PDF (fácil de adicionar depois se precisar)