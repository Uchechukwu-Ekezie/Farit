-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─── Profiles ────────────────────────────────────────────────────────────────
create table profiles (
  id             uuid references auth.users primary key,
  wallet_address text,
  wallet_type    text check (wallet_type in ('self_custodial', 'embedded')),
  created_at     timestamptz default now()
);

-- ─── Agent Configs ───────────────────────────────────────────────────────────
create table agent_configs (
  id                          uuid primary key default gen_random_uuid(),
  user_id                     uuid references profiles(id) on delete cascade unique,
  agent_name                  text not null default 'SAGE',
  personality                 text default 'professional'
                                check (personality in ('professional','friendly','degen')),
  ai_provider                 text not null default 'anthropic'
                                check (ai_provider in ('anthropic','openai','gemini')),
  ai_model                    text not null default 'claude-sonnet-4-20250514',
  auto_approve_threshold_usd  numeric not null default 10.00,
  enabled_actions             text[] default array['send','swap','stake'],
  created_at                  timestamptz default now(),
  updated_at                  timestamptz default now()
);

-- ─── Agent Messages ───────────────────────────────────────────────────────────
create table agent_messages (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references profiles(id) on delete cascade,
  role          text check (role in ('user','assistant','system')),
  content       text not null,
  action_type   text,
  action_data   jsonb,
  action_status text check (action_status in ('pending','approved','rejected','executed') or action_status is null),
  tx_signature  text,
  created_at    timestamptz default now()
);

-- ─── Row Level Security ───────────────────────────────────────────────────────
alter table profiles       enable row level security;
alter table agent_configs  enable row level security;
alter table agent_messages enable row level security;

create policy "own profile"   on profiles       for all using (auth.uid() = id);
create policy "own config"    on agent_configs  for all using (auth.uid() = user_id);
create policy "own messages"  on agent_messages for all using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Index for message history lookups
create index agent_messages_user_created
  on agent_messages (user_id, created_at);
