-- 1. Create Invoices Table
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    invoice_no TEXT,
    date DATE NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Invoice Items Table (to track products for AI analysis later)
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    pack TEXT,
    quantity DECIMAL(10,2) NOT NULL,
    rate DECIMAL(10,2) NOT NULL,
    amount DECIMAL(12,2) NOT NULL
);

-- 3. Create Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    date DATE NOT NULL,
    payment_mode TEXT,
    reference_no TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 5. Create Policies (Allow all for anon/authenticated for now, similar to existing tables)
CREATE POLICY "Enable read access for all users" ON public.invoices FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.invoices FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.invoices FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.invoices FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.invoice_items FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.invoice_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.invoice_items FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.invoice_items FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.payments FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.payments FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.payments FOR DELETE USING (true);

-- 6. Insert Storage Bucket for PDF Invoices
INSERT INTO storage.buckets (id, name, public) 
VALUES ('invoice_pdfs', 'invoice_pdfs', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to the bucket
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'invoice_pdfs');

CREATE POLICY "Public Insert" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'invoice_pdfs');
