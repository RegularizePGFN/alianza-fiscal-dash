## Inventário — Controle de equipamentos da empresa

Módulo administrativo simples e prático para saber **com quem está o quê** na empresa.

### Onde fica
- Menu lateral, grupo **Administrativo**, item **"Inventário"** (ícone `Package`), visível só para admins.
- Rota: `/inventario`.

### Tela única (sem abas)

**Topo — 4 KPIs compactos:**
Total de itens · Em uso · Disponíveis · Em manutenção

**Barra de ações:**
- Busca (nome, tag, serial, colaborador)
- Filtro por tipo · Filtro por status
- Botão **"+ Novo item"**

**Tabela:**
| Tag | Item | Tipo | Status (badge) | Com quem | Desde | Ações |

- "Com quem" mostra nome do colaborador ou "—"
- Ações: **Atribuir / Devolver** (botão contextual conforme status), **Editar**, **Excluir**

### Modais (2 só, prático)

**1. Modal "Novo / Editar item"** — campos enxutos:
- Nome *
- Tipo: Notebook · Celular · Monitor · Headset · Tablet · Outros *
- Marca / Modelo
- Nº de série / IMEI
- Tag (auto-gerada `EQ-0001` se vazia)
- Data de aquisição · Valor (opcional)
- Condição: Novo · Bom · Regular · Danificado
- Status manual: Disponível · Manutenção · Aposentado (não escolhe "Em uso" — vira automático ao atribuir)
- Observações

**2. Modal "Atribuir / Devolver"**
- Se disponível → form para **atribuir**: colaborador (select dos usuários), data de entrega (hoje), observação
- Se em uso → form para **devolver**: data de devolução (hoje), condição na devolução, observação
- Embaixo do form: lista compacta do **histórico de quem usou** esse item (colaborador, período, condição) — somente leitura

Sem timeline elaborada nem aba separada — tudo no mesmo modal.

### Regras

- Só admin vê e mexe.
- Um item só tem **uma atribuição ativa** por vez.
- Status sincroniza automático: ao atribuir → `em_uso`; ao devolver → `disponivel`. Se admin marcou `manutencao` ou `aposentado`, esses estados têm prioridade e não são sobrescritos.
- Tag única, gerada sequencialmente se não informada.

### Detalhes técnicos

**Migration — duas tabelas + RLS admin-only:**

```sql
create table public.equipment (
  id uuid primary key default gen_random_uuid(),
  tag text unique not null,           -- auto EQ-0001 via trigger
  name text not null,
  type text not null default 'outros',
  brand text, model text,
  serial_number text, imei text,
  acquisition_date date,
  acquisition_value numeric,
  condition text not null default 'bom',
  status text not null default 'disponivel',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.equipment_assignments (
  id uuid primary key default gen_random_uuid(),
  equipment_id uuid not null references equipment(id) on delete cascade,
  user_id uuid not null,
  user_name text not null,            -- snapshot
  assigned_at date not null default current_date,
  returned_at date,                   -- null = ativa
  condition_on_assign text,
  condition_on_return text,
  notes text,
  created_at timestamptz default now()
);
```

- RLS `ALL` em ambas restrita a `get_current_user_role() = 'admin'`.
- Trigger `set_equipment_tag` (gera `EQ-0001` se vazio).
- Trigger `sync_equipment_status` em `equipment_assignments` (insert/update/delete) — respeita override `manutencao`/`aposentado`.
- Trigger `updated_at` reusando `update_updated_at_column()`.

**Frontend:**
- `src/pages/InventoryPage.tsx` (guard de admin)
- `src/components/inventory/`
  - `InventoryContainer.tsx` (KPIs + filtros + tabela)
  - `InventoryKpiCards.tsx`
  - `InventoryFilters.tsx`
  - `InventoryTable.tsx`
  - `EquipmentFormModal.tsx`
  - `AssignmentModal.tsx` (atribuir/devolver + histórico)
- `src/hooks/useInventory.ts` (React Query: list, save, delete, assign, return, history)
- `src/App.tsx` — rota `/inventario`
- `src/components/layout/AppSidebar.tsx` — link no grupo Administrativo (ícone `Package`, admin-only)

### Fora do escopo desta v1
Upload de foto/nota fiscal, depreciação, alertas de manutenção, exportação CSV/PDF.