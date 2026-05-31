-- Migration: Add Settings and Historical Snapshots

-- User Settings Table
create table public.user_settings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  monthly_revenue_target numeric default 2000,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint unique_user_settings unique (user_id)
);

-- Historical Snapshots Table
create table public.historical_snapshots (
  id uuid primary key default uuid_generate_v4(),
  date timestamptz not null default now(),
  total_customers integer default 0,
  active_customers integer default 0,
  pending_orders integer default 0,
  total_outstanding numeric default 0,
  total_sales numeric default 0
);

-- RLS Policies for user_settings
alter table public.user_settings enable row level security;
create policy "Users can view their own settings" on public.user_settings for select using (auth.uid() = user_id);
create policy "Users can update their own settings" on public.user_settings for update using (auth.uid() = user_id);
create policy "Users can insert their own settings" on public.user_settings for insert with check (auth.uid() = user_id);

-- RLS Policies for historical_snapshots
alter table public.historical_snapshots enable row level security;
create policy "Allow authenticated access to snapshots" on public.historical_snapshots for all using (auth.role() = 'authenticated');
