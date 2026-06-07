-- ============================================================
-- DEFINITIVE FIX - Run on Madrosc02's Project (uxstrrdgyqdrcrpqtkwq)
-- ============================================================

-- STEP 1: CHECK - How many rows exist? (Share these results with me)
SELECT 'customers' as tbl, COUNT(*) as rows FROM customers
UNION ALL SELECT 'sales', COUNT(*) FROM sales
UNION ALL SELECT 'remarks', COUNT(*) FROM remarks
UNION ALL SELECT 'tasks', COUNT(*) FROM tasks
UNION ALL SELECT 'user_roles', COUNT(*) FROM user_roles;

-- STEP 2: CHECK - What users exist and their status?
SELECT email, role, status FROM user_roles ORDER BY created_at DESC;

-- STEP 3: FIX - Approve ALL users immediately
UPDATE public.user_roles
SET status = 'approved', updated_at = NOW()
WHERE status != 'approved';

-- STEP 4: FIX - Make is_approved_user() work for everyone
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

-- STEP 5: FIX - Auto-approve future signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, email, role, status)
  VALUES (new.id, new.email, 'user', 'approved')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 6: FIX - Drop overly-restrictive RLS and replace with simple auth check
-- This ensures any logged-in user can see ALL shared data

-- Customers
DROP POLICY IF EXISTS "Allow authenticated access" ON public.customers;
CREATE POLICY "Allow authenticated access" ON public.customers
  FOR ALL USING (auth.role() = 'authenticated');

-- Sales
DROP POLICY IF EXISTS "Allow authenticated access" ON public.sales;
CREATE POLICY "Allow authenticated access" ON public.sales
  FOR ALL USING (auth.role() = 'authenticated');

-- Remarks
DROP POLICY IF EXISTS "Allow authenticated access" ON public.remarks;
CREATE POLICY "Allow authenticated access" ON public.remarks
  FOR ALL USING (auth.role() = 'authenticated');

-- Tasks
DROP POLICY IF EXISTS "Allow authenticated access" ON public.tasks;
CREATE POLICY "Allow authenticated access" ON public.tasks
  FOR ALL USING (auth.role() = 'authenticated');

-- Goals
DROP POLICY IF EXISTS "Allow authenticated access" ON public.goals;
CREATE POLICY "Allow authenticated access" ON public.goals
  FOR ALL USING (auth.role() = 'authenticated');

-- Milestones
DROP POLICY IF EXISTS "Allow authenticated access" ON public.milestones;
CREATE POLICY "Allow authenticated access" ON public.milestones
  FOR ALL USING (auth.role() = 'authenticated');

-- Historical snapshots
DROP POLICY IF EXISTS "Allow authenticated access to snapshots" ON public.historical_snapshots;
DROP POLICY IF EXISTS "Allow authenticated access" ON public.historical_snapshots;
CREATE POLICY "Allow authenticated access" ON public.historical_snapshots
  FOR ALL USING (auth.role() = 'authenticated');

-- Customer territories (if exists)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customer_territories' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "Allow authenticated access" ON public.customer_territories;
    CREATE POLICY "Allow authenticated access" ON public.customer_territories
      FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- Invoices (if exists)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invoices' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "Allow authenticated access" ON public.invoices;
    CREATE POLICY "Allow authenticated access" ON public.invoices
      FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- Invoice items (if exists)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invoice_items' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "Allow authenticated access" ON public.invoice_items;
    CREATE POLICY "Allow authenticated access" ON public.invoice_items
      FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- Payments (if exists)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "Allow authenticated access" ON public.payments;
    CREATE POLICY "Allow authenticated access" ON public.payments
      FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- User settings - keep user-specific policies
DROP POLICY IF EXISTS "Users can view their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON public.user_settings;
CREATE POLICY "Users can view their own settings" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own settings" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User roles - keep role-based policies
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can read all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
CREATE POLICY "Users can read own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all roles" ON public.user_roles FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE USING (public.is_admin());

-- STEP 7: VERIFY - Final check
SELECT 'customers' as tbl, COUNT(*) as rows FROM customers
UNION ALL SELECT 'sales', COUNT(*) FROM sales
UNION ALL SELECT 'user_roles', COUNT(*) FROM user_roles;

SELECT email, role, status FROM user_roles ORDER BY created_at DESC;
