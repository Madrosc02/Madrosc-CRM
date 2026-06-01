-- 1. MEDICAL REPRESENTATIVES
CREATE TABLE IF NOT EXISTS public.medical_representatives (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete set null,
    name text not null,
    territory_patch text not null,
    state text,
    district text,
    created_at timestamptz default now()
);

-- 2. HEALTHCARE PROVIDERS (HCP)
CREATE TABLE IF NOT EXISTS public.healthcare_providers (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    specialty text not null,
    brick_patch_code text not null,
    contact text,
    hospital_clinic text,
    assigned_mr uuid references public.medical_representatives(id) on delete set null,
    created_at timestamptz default now()
);

-- 3. LOYALTY LEDGERS
CREATE TABLE IF NOT EXISTS public.loyalty_ledgers (
    id uuid primary key default uuid_generate_v4(),
    customer_id uuid references public.customers(id) on delete cascade,
    hcp_id uuid references public.healthcare_providers(id) on delete cascade,
    transaction_type text not null, -- e.g., 'Bonus', 'Penalty', 'Redemption', 'Standard'
    points numeric not null, -- Supports negative for penalties
    description text,
    transaction_date timestamptz default now()
);

-- Enable Row Level Security
alter table public.medical_representatives enable row level security;
alter table public.healthcare_providers enable row level security;
alter table public.loyalty_ledgers enable row level security;

-- Policies for Authenticated Access (CRM Users)
create policy "Allow authenticated access" on public.medical_representatives for all using (auth.role() = 'authenticated');
create policy "Allow authenticated access" on public.healthcare_providers for all using (auth.role() = 'authenticated');
create policy "Allow authenticated access" on public.loyalty_ledgers for all using (auth.role() = 'authenticated');
