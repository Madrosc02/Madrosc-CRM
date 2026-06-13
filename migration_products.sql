CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_name TEXT NOT NULL,
    composition TEXT NOT NULL,
    mrp DECIMAL(10,2) NOT NULL,
    purchase_rate DECIMAL(10,2) NOT NULL,
    packing TEXT NOT NULL,
    segment TEXT,
    hsn_code TEXT,
    gst_percentage DECIMAL(5,2),
    manufacturer TEXT,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON public.products FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable insert access for authenticated users" ON public.products FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Enable update access for authenticated users" ON public.products FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable delete access for authenticated users" ON public.products FOR DELETE USING (auth.uid() IS NOT NULL);
