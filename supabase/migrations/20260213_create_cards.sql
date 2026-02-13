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

alter table cards enable row level security;

create policy "Allow all for authenticated" on cards for all using (true) with check (true);
create policy "Allow all for anon" on cards for all to anon using (true) with check (true);

alter publication supabase_realtime add table cards;

create index idx_cards_column on cards(column_name);
create index idx_cards_assignee on cards(assignee);
create index idx_cards_priority on cards(priority);
create index idx_cards_due_date on cards(due_date);

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
