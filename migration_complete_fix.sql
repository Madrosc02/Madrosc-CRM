-- ============================================================
-- COMPLETE DATABASE DIAGNOSTIC & FIX
-- Run in Supabase SQL Editor for project: uxstrrdgyqdrcrpqtkwq
-- ============================================================

-- STEP 1: Check how many rows exist in each table
SELECT 'customers' as table_name, COUNT(*) as row_count FROM customers
UNION ALL SELECT 'sales', COUNT(*) FROM sales
UNION ALL SELECT 'remarks', COUNT(*) FROM remarks
UNION ALL SELECT 'tasks', COUNT(*) FROM tasks
UNION ALL SELECT 'goals', COUNT(*) FROM goals
UNION ALL SELECT 'milestones', COUNT(*) FROM milestones
UNION ALL SELECT 'user_roles', COUNT(*) FROM user_roles
UNION ALL SELECT 'user_settings', COUNT(*) FROM user_settings
UNION ALL SELECT 'historical_snapshots', COUNT(*) FROM historical_snapshots;

-- STEP 2: Check all user_roles status
SELECT email, role, status FROM user_roles ORDER BY created_at DESC;

-- STEP 3: Ensure is_approved_user() works correctly
-- (If you already ran migration_fix_user_approval.sql, this is a no-op)
CREATE OR REPLACE FUNCTION public.is_approved_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND status = 'approved')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 4: Approve ALL users
UPDATE public.user_roles
SET status = 'approved', updated_at = NOW()
WHERE status != 'approved';

-- STEP 5: Ensure RLS policies exist for ALL tables including newer ones
-- Products table (if it exists)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products' AND table_schema = 'public') THEN
    ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow authenticated access" ON public.products;
    CREATE POLICY "Allow authenticated access" ON public.products FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- Invoices
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invoices' AND table_schema = 'public') THEN
    ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow authenticated access" ON public.invoices;
    CREATE POLICY "Allow authenticated access" ON public.invoices FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- Invoice items
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invoice_items' AND table_schema = 'public') THEN
    ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow authenticated access" ON public.invoice_items;
    CREATE POLICY "Allow authenticated access" ON public.invoice_items FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- Payments
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments' AND table_schema = 'public') THEN
    ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow authenticated access" ON public.payments;
    CREATE POLICY "Allow authenticated access" ON public.payments FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- Customer territories
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customer_territories' AND table_schema = 'public') THEN
    ALTER TABLE public.customer_territories ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow authenticated access" ON public.customer_territories;
    CREATE POLICY "Allow authenticated access" ON public.customer_territories FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- STEP 6: Final verification
SELECT 'customers' as table_name, COUNT(*) as row_count FROM customers
UNION ALL SELECT 'user_roles', COUNT(*) FROM user_roles;

SELECT email, role, status FROM user_roles ORDER BY created_at DESC;
