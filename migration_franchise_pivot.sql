-- 1. DROP OBSOLETE TABLES
DROP TABLE IF EXISTS public.healthcare_providers CASCADE;
DROP TABLE IF EXISTS public.medical_representatives CASCADE;

-- 2. CREATE NEW TABLES
-- Sales Executives
CREATE TABLE IF NOT EXISTS public.sales_executives (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    contact_number text,
    created_at timestamptz default now()
);

-- Franchise Clients
CREATE TABLE IF NOT EXISTS public.franchise_clients (
    id uuid primary key default uuid_generate_v4(),
    business_name text not null,
    contact_person text not null,
    phone_whatsapp text not null,
    email text,
    assigned_executive_id uuid references public.sales_executives(id) on delete set null,
    created_at timestamptz default now()
);

-- Interaction Logs
CREATE TABLE IF NOT EXISTS public.interaction_logs (
    id uuid primary key default uuid_generate_v4(),
    client_id uuid references public.franchise_clients(id) on delete cascade,
    channel text not null check (channel in ('WhatsApp', 'Call', 'Email')),
    interaction_notes text not null,
    timestamp timestamptz default now()
);

-- 3. MAINTAIN LOYALTY LEDGER (Update Schema)
-- If the table doesn't exist yet, create its base structure
CREATE TABLE IF NOT EXISTS public.loyalty_ledgers (
    id uuid primary key default uuid_generate_v4(),
    transaction_type text not null, -- e.g., 'Bonus', 'Penalty', 'Redemption', 'Standard'
    points numeric not null, -- Supports negative for penalties
    description text,
    transaction_date timestamptz default now()
);

-- Remove the old columns that reference customers or hcps, if they exist
ALTER TABLE public.loyalty_ledgers DROP COLUMN IF EXISTS customer_id;
ALTER TABLE public.loyalty_ledgers DROP COLUMN IF EXISTS hcp_id;

-- Add new column for franchise clients
ALTER TABLE public.loyalty_ledgers ADD COLUMN IF NOT EXISTS franchise_client_id uuid references public.franchise_clients(id) on delete cascade;

-- Enable Row Level Security
alter table public.sales_executives enable row level security;
alter table public.franchise_clients enable row level security;
alter table public.interaction_logs enable row level security;
alter table public.loyalty_ledgers enable row level security;

-- Policies for Authenticated Access (CRM Users)
create policy "Allow authenticated access" on public.sales_executives for all using (auth.role() = 'authenticated');
create policy "Allow authenticated access" on public.franchise_clients for all using (auth.role() = 'authenticated');
create policy "Allow authenticated access" on public.interaction_logs for all using (auth.role() = 'authenticated');
create policy "Allow authenticated access" on public.loyalty_ledgers for all using (auth.role() = 'authenticated');
