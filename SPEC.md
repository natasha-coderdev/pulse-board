# Pulse Board — Specification

## Overview
A kanban-style task/life management board for Jorge and Natasha (AI assistant) to collaborate on tasks, ideas, reminders, and action plans.

## Tech Stack
- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS + shadcn/ui components
- **Drag & Drop:** @dnd-kit/core + @dnd-kit/sortable
- **Database:** Supabase (Postgres + Realtime)
- **Auth:** Supabase Auth (email/password for now)
- **Hosting:** Vercel

## Kanban Columns
1. **Inbox** — New items land here
2. **Planned** — Scheduled/prioritized
3. **In Progress** — Currently being worked on
4. **Waiting** — Blocked or waiting on something
5. **Done** — Completed
6. **Parked** — Ideas/tasks on hold

## Card Model
```typescript
interface Card {
  id: string;
  title: string;
  description?: string;
  type: 'idea' | 'task' | 'plan' | 'reminder';
  column: 'inbox' | 'planned' | 'in_progress' | 'waiting' | 'done' | 'parked';
  assignee: 'jorge' | 'natasha' | 'both';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  tags: string[];
  checklist: { id: string; text: string; done: boolean }[];
  output?: string;
  position: number; // for ordering within column
  created_at: string;
  updated_at: string;
}
```

## Features — Phase 1 (Build Now)

### Board View
- 6 columns displayed horizontally, scrollable on mobile
- Cards show: title, type icon, assignee avatar, priority indicator, due date (if set)
- Drag and drop cards between columns and reorder within columns
- Column card counts

### Card CRUD
- Click "+" on any column to add a card
- Click a card to open detail modal/panel
- Edit all fields inline in the detail view
- Delete card (with confirmation)

### Card Detail Panel
- Title (editable, large)
- Description (markdown support, editable)
- Type selector (idea/task/plan/reminder)
- Assignee selector (Jorge/Natasha/Both)
- Priority selector (low/medium/high/urgent)
- Due date picker
- Tags (add/remove)
- Checklist (add items, check/uncheck)
- Output section (for results/deliverables)
- Created/updated timestamps

### Design
- Clean, minimal, modern
- Dark mode by default (with light mode toggle)
- Color coding by priority:
  - Low: gray
  - Medium: blue
  - High: orange
  - Urgent: red
- Type icons:
  - 💡 Idea
  - ✅ Task
  - 📋 Plan
  - ⏰ Reminder
- Assignee indicators:
  - Jorge: "J" avatar (blue)
  - Natasha: "N" avatar (purple)
  - Both: "JN" avatar (gradient)
- Responsive: works on desktop and mobile

### Supabase Setup
- Create `cards` table matching the Card model
- Row Level Security (RLS) enabled
- Realtime subscriptions for live updates
- Indexes on: column, assignee, priority, due_date

## Database SQL
```sql
create table cards (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  type text not null default 'task' check (type in ('idea', 'task', 'plan', 'reminder')),
  column_name text not null default 'inbox' check (column_name in ('inbox', 'planned', 'in_progress', 'waiting', 'done', 'parked')),
  assignee text not null default 'jorge' check (assignee in ('jorge', 'natasha', 'both')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  due_date timestamptz,
  tags text[] default '{}',
  checklist jsonb default '[]',
  output text,
  position integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table cards enable row level security;

-- Allow all operations for authenticated users
create policy "Allow all for authenticated" on cards for all using (true) with check (true);

-- Enable realtime
alter publication supabase_realtime add table cards;

-- Indexes
create index idx_cards_column on cards(column_name);
create index idx_cards_assignee on cards(assignee);
create index idx_cards_priority on cards(priority);
create index idx_cards_due_date on cards(due_date);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger cards_updated_at
  before update on cards
  for each row
  execute function update_updated_at();
```

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=<from supabase project>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from supabase project>
```

## File Structure
```
pulse-board/
├── app/
│   ├── layout.tsx
│   ├── page.tsx (board view)
│   ├── globals.css
│   └── providers.tsx
├── components/
│   ├── board/
│   │   ├── Board.tsx (main board with columns)
│   │   ├── Column.tsx (single column)
│   │   ├── Card.tsx (card in column)
│   │   ├── CardDetail.tsx (detail panel/modal)
│   │   ├── AddCard.tsx (new card form)
│   │   └── SortableCard.tsx (dnd wrapper)
│   └── ui/ (shadcn components)
├── lib/
│   ├── supabase.ts (client)
│   ├── types.ts (Card interface, etc.)
│   └── utils.ts
├── hooks/
│   └── useCards.ts (CRUD + realtime)
├── public/
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

## Important Notes
- Use `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"` to scaffold
- Use `npx shadcn@latest init` then add components as needed (dialog, button, input, select, badge, calendar, popover, dropdown-menu, checkbox)
- Make sure dark mode works via class strategy in tailwind config
- The board should feel snappy — optimistic updates for drag-and-drop
