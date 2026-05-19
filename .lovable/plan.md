## Efeitos sonoros e notificações para cadastros

Sim, é totalmente possível. Já existe infraestrutura parecida no sistema (som global `sale-notification.mp3` + toast para vendas via Realtime), vamos seguir o mesmo padrão para cadastros.

### O que vai acontecer

**1. Vendedor cria um novo cadastro**
- Todos os usuários **backoffice** (e admin) logados ouvem um som de "novo cadastro" e veem um toast: *"Novo cadastro de {vendedor}: {cliente}"*.
- Clicando no toast → abre a tela de Cadastros já filtrada.

**2. Backoffice marca o cadastro como "Realizado"**
- O **vendedor que pediu** o cadastro:
  - Ouve um som de "cadastro pronto" (se estiver com a aba aberta).
  - Recebe um toast: *"Seu cadastro de {cliente} foi concluído"*.
  - Recebe uma **notificação persistente** no sininho (popover de notificações), que fica lá até ele marcar como lida.

**3. Backoffice marca como "Pendente" ou "Cancelado"** (bônus, mesma mecânica)
- Vendedor recebe notificação no sininho explicando a situação + motivo (campo notes), sem som intrusivo (apenas toast discreto).

### Sons

Dois arquivos novos em `public/`:
- `registration-created.mp3` — toque curto e neutro (para backoffice).
- `registration-done.mp3` — toque curto e positivo (para vendedor).

Posso gerar via ElevenLabs SFX, ou você prefere subir arquivos próprios?

### Onde toca o som

- Player global montado no `AppLayout` (igual ao de vendas), escutando Realtime de `client_registrations`.
- Respeita a aba ativa: se a aba estiver em background, ainda toca (igual hoje em vendas).
- Volume baixo padrão; possível adicionar toggle "silenciar sons" no perfil futuramente (fora do escopo agora, salvo se você pedir).

### Detalhes técnicos

- **Realtime**: habilitar replicação realtime em `public.client_registrations` (INSERT e UPDATE de `status`).
- **Hook novo**: `useRegistrationsRealtimeSound` montado no `AppLayout`, com lógica:
  - INSERT → se `user.role ∈ {admin, backoffice}` e `salesperson_id ≠ user.id` → som de criação + toast.
  - UPDATE com `status` mudando para `realizado|pendente|cancelado` → se `user.id === row.salesperson_id` → som (só em "realizado") + toast + inserir linha em `notifications`.
- **Notificações persistentes**: já existe tabela `notifications` e popover (`NotificationsPopover`). Vamos só inserir um registro novo quando o status muda — feito via **trigger no banco** (`AFTER UPDATE`), assim funciona mesmo se o vendedor estiver offline.
- **RLS**: política de INSERT em `notifications` para o trigger (SECURITY DEFINER) — sem mudar policies do usuário.

### Arquivos afetados

- Novo: `src/hooks/useRegistrationsRealtimeSound.ts`
- Novo: `public/registration-created.mp3`, `public/registration-done.mp3`
- Edit: `src/components/layout/AppLayout.tsx` (montar o hook)
- Migration: habilitar realtime em `client_registrations` + trigger `notify_salesperson_on_registration_status_change`.

### Perguntas rápidas antes de implementar

1. Os sons: **gero via ElevenLabs** ou você vai subir os MP3?
2. Quando o status vira **Pendente** ou **Cancelado**, deve tocar som também ou só notificação silenciosa? (sugiro só notificação)
3. Backoffice deve ouvir som também quando **outro** backoffice cria/atualiza, ou só quando vendedor cria? (sugiro: som só no INSERT por vendedor)
