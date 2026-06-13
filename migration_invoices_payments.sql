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

-- 5. Create Policies (Require authenticated users)
CREATE POLICY "Enable read access for authenticated users" ON public.invoices FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable insert access for authenticated users" ON public.invoices FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Enable update access for authenticated users" ON public.invoices FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable delete access for authenticated users" ON public.invoices FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable read access for authenticated users" ON public.invoice_items FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable insert access for authenticated users" ON public.invoice_items FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Enable update access for authenticated users" ON public.invoice_items FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable delete access for authenticated users" ON public.invoice_items FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable read access for authenticated users" ON public.payments FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable insert access for authenticated users" ON public.payments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Enable update access for authenticated users" ON public.payments FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable delete access for authenticated users" ON public.payments FOR DELETE USING (auth.uid() IS NOT NULL);

-- 6. Insert Storage Bucket for PDF Invoices
INSERT INTO storage.buckets (id, name, public) 
VALUES ('invoice_pdfs', 'invoice_pdfs', false)
ON CONFLICT (id) DO NOTHING;

-- Restrict access to the bucket to authenticated users
CREATE POLICY "Authenticated Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'invoice_pdfs' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated Insert" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'invoice_pdfs' AND auth.uid() IS NOT NULL);
