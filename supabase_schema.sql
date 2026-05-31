-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Customers Table
create table public.customers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  contact text,
  alternate_contact text,
  avatar text,
  tier text,
  state text,
  district text,
  sales_this_month numeric default 0,
  avg_6_mo_sales numeric default 0,
  outstanding_balance numeric default 0,
  days_since_last_order numeric default 0,
  tags text[] default '{}',
  last_updated timestamptz default now()
);

-- Sales Table
create table public.sales (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references public.customers(id) on delete cascade,
  amount numeric not null,
  date timestamptz not null
);

-- Remarks Table
create table public.remarks (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references public.customers(id) on delete cascade,
  remark text not null,
  timestamp timestamptz default now(),
  "user" text,
  sentiment text
);

-- Tasks Table
create table public.tasks (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references public.customers(id) on delete cascade,
  customer_name text,
  task text not null,
  due_date timestamptz not null,
  completed boolean default false
);

-- Goals Table
create table public.goals (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references public.customers(id) on delete cascade,
  title text not null,
  target_amount numeric not null,
  current_amount numeric default 0,
  deadline timestamptz not null,
  status text default 'InProgress'
);

-- Milestones Table
create table public.milestones (
  id uuid primary key default uuid_generate_v4(),
  goal_id uuid references public.goals(id) on delete cascade,
  description text not null,
  target_date timestamptz not null,
  completed boolean default false
);

-- Enable Row Level Security (RLS)
alter table public.customers enable row level security;
alter table public.sales enable row level security;
alter table public.remarks enable row level security;
alter table public.tasks enable row level security;
alter table public.goals enable row level security;
alter table public.milestones enable row level security;

-- Create policies to allow public access (since we are using anon key for simple CRM)
-- Create policies to allow access only to authenticated users
create policy "Allow authenticated access" on public.customers for all using (auth.role() = 'authenticated');
create policy "Allow authenticated access" on public.sales for all using (auth.role() = 'authenticated');
create policy "Allow authenticated access" on public.remarks for all using (auth.role() = 'authenticated');
create policy "Allow authenticated access" on public.tasks for all using (auth.role() = 'authenticated');
create policy "Allow authenticated access" on public.goals for all using (auth.role() = 'authenticated');
create policy "Allow authenticated access" on public.milestones for all using (auth.role() = 'authenticated');

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