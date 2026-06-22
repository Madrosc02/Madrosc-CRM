-- ============================================================================
-- DEFINITIVE RLS FIX MIGRATION
-- Purpose : Fix all Row Level Security policies so authenticated users can
--           actually read and write data in the CRM.
-- Problem : Authenticated users can log in but see NO data because existing
--           RLS policies are too restrictive or missing WITH CHECK clauses.
-- Strategy:
--   1. Disable RLS on every table (immediate unblock while migration runs)
--   2. Drop every existing policy (clean slate)
--   3. Re-enable RLS on every table
--   4. Create simple, correct policies with BOTH  USING  and  WITH CHECK
--   5. Create helper functions (is_admin, is_approved_user, handle_new_user)
--   6. Auto-approve all existing users
-- Date    : 2026-06-18
-- ============================================================================

-- Run everything inside a single transaction so it's all-or-nothing.
BEGIN;

-- ════════════════════════════════════════════════════════════════════════════
-- STEP 0 · HELPER: safely execute SQL that may reference tables which don't
--          exist yet.  We wrap each block in  DO $$ … EXCEPTION … END $$
-- ════════════════════════════════════════════════════════════════════════════

-- ════════════════════════════════════════════════════════════════════════════
-- STEP 1 · DISABLE RLS on ALL tables
-- This makes data immediately accessible while the rest of the migration
-- runs, so there is zero downtime for users who are currently logged in.
-- ════════════════════════════════════════════════════════════════════════════

-- Core tables (guaranteed to exist) -------------------------------------------
ALTER TABLE public.customers           DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales               DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.remarks             DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks               DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals               DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones          DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.historical_snapshots DISABLE ROW LEVEL SECURITY;

-- User-specific tables (guaranteed to exist) ----------------------------------
ALTER TABLE public.user_settings       DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles          DISABLE ROW LEVEL SECURITY;

-- Optional tables (may not exist) ---------------------------------------------
DO $$ BEGIN
  ALTER TABLE public.customer_territories DISABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN
  RAISE NOTICE 'Table customer_territories does not exist – skipping.';
END $$;

DO $$ BEGIN
  ALTER TABLE public.invoices DISABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN
  RAISE NOTICE 'Table invoices does not exist – skipping.';
END $$;

DO $$ BEGIN
  ALTER TABLE public.invoice_items DISABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN
  RAISE NOTICE 'Table invoice_items does not exist – skipping.';
END $$;

DO $$ BEGIN
  ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN
  RAISE NOTICE 'Table payments does not exist – skipping.';
END $$;

DO $$ BEGIN
  ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN
  RAISE NOTICE 'Table products does not exist – skipping.';
END $$;


-- ════════════════════════════════════════════════════════════════════════════
-- STEP 2 · DROP ALL existing policies on every table
-- We need a clean slate – old broken policies are the root cause.
-- ════════════════════════════════════════════════════════════════════════════

-- Helper: drop every policy on a given table regardless of policy name.
-- This uses the pg_policies catalog so we don't have to guess names.

DO $$
DECLARE
  _pol RECORD;
BEGIN
  FOR _pol IN
    SELECT schemaname, tablename, policyname
      FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename IN (
         'customers', 'sales', 'remarks', 'tasks', 'goals',
         'milestones', 'historical_snapshots', 'customer_territories',
         'invoices', 'invoice_items', 'payments', 'products',
         'user_settings', 'user_roles'
       )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
                   _pol.policyname, _pol.schemaname, _pol.tablename);
    RAISE NOTICE 'Dropped policy "%" on %.%', _pol.policyname, _pol.schemaname, _pol.tablename;
  END LOOP;
END $$;


-- ════════════════════════════════════════════════════════════════════════════
-- STEP 3 · RE-ENABLE RLS on ALL tables
-- Policies created in Step 4 will take effect only when RLS is enabled.
-- ════════════════════════════════════════════════════════════════════════════

-- Core tables -----------------------------------------------------------------
ALTER TABLE public.customers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.remarks             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historical_snapshots ENABLE ROW LEVEL SECURITY;

-- User-specific tables --------------------------------------------------------
ALTER TABLE public.user_settings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles          ENABLE ROW LEVEL SECURITY;

-- Optional tables -------------------------------------------------------------
DO $$ BEGIN
  ALTER TABLE public.customer_territories ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;


-- ════════════════════════════════════════════════════════════════════════════
-- STEP 4 · CREATE helper functions
-- ════════════════════════════════════════════════════════════════════════════

-- 4a. is_admin() – returns TRUE when the current user has role = 'admin'
--     in the user_roles table.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
      FROM public.user_roles
     WHERE user_id = auth.uid()
       AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION public.is_admin() IS
  'Returns true if the current authenticated user has an admin role.';


-- 4b. is_approved_user() – returns TRUE when the current user either:
--     (a) has no row in user_roles (i.e. role not yet assigned → treat as approved)
--     (b) has a row with is_approved = true OR status = 'approved'
CREATE OR REPLACE FUNCTION public.is_approved_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid())
    OR
    EXISTS (
      SELECT 1
        FROM public.user_roles
       WHERE user_id = auth.uid()
         AND (is_approved = true OR status = 'approved')
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION public.is_approved_user() IS
  'Returns true if the current authenticated user is approved or has no role entry.';


-- ════════════════════════════════════════════════════════════════════════════
-- STEP 5 · CREATE new RLS policies
--
-- Key rules:
--   • Shared data tables → any authenticated user can do everything.
--     We use  FOR ALL  with  USING (true)  AND  WITH CHECK (true),
--     gated by  auth.role() = 'authenticated'.
--   • user_settings → users can only see/modify their own rows.
--   • user_roles → users can read their own role; admins can read/update all.
--
-- ⚠ CRITICAL: FOR ALL policies MUST have both  USING  and  WITH CHECK.
--   USING  controls SELECT / UPDATE-read / DELETE visibility.
--   WITH CHECK  controls INSERT / UPDATE-write validation.
--   Without WITH CHECK, inserts and updates will SILENTLY FAIL.
-- ════════════════════════════════════════════════════════════════════════════

-- ── 5a. SHARED DATA TABLES ─────────────────────────────────────────────────
-- Pattern: any authenticated user gets full CRUD access.

-- customers -------------------------------------------------------------------
CREATE POLICY "customers_authenticated_access"
  ON public.customers
  FOR ALL
  TO authenticated
  USING  (true)
  WITH CHECK (true);

-- sales -----------------------------------------------------------------------
CREATE POLICY "sales_authenticated_access"
  ON public.sales
  FOR ALL
  TO authenticated
  USING  (true)
  WITH CHECK (true);

-- remarks ---------------------------------------------------------------------
CREATE POLICY "remarks_authenticated_access"
  ON public.remarks
  FOR ALL
  TO authenticated
  USING  (true)
  WITH CHECK (true);

-- tasks -----------------------------------------------------------------------
CREATE POLICY "tasks_authenticated_access"
  ON public.tasks
  FOR ALL
  TO authenticated
  USING  (true)
  WITH CHECK (true);

-- goals -----------------------------------------------------------------------
CREATE POLICY "goals_authenticated_access"
  ON public.goals
  FOR ALL
  TO authenticated
  USING  (true)
  WITH CHECK (true);

-- milestones ------------------------------------------------------------------
CREATE POLICY "milestones_authenticated_access"
  ON public.milestones
  FOR ALL
  TO authenticated
  USING  (true)
  WITH CHECK (true);

-- historical_snapshots --------------------------------------------------------
CREATE POLICY "historical_snapshots_authenticated_access"
  ON public.historical_snapshots
  FOR ALL
  TO authenticated
  USING  (true)
  WITH CHECK (true);

-- ── 5b. OPTIONAL SHARED DATA TABLES (wrapped for safety) ───────────────────

-- customer_territories --------------------------------------------------------
DO $$ BEGIN
  CREATE POLICY "customer_territories_authenticated_access"
    ON public.customer_territories
    FOR ALL
    TO authenticated
    USING  (true)
    WITH CHECK (true);
  RAISE NOTICE 'Policy created on customer_territories.';
EXCEPTION WHEN undefined_table THEN
  RAISE NOTICE 'Table customer_territories does not exist – skipping policy.';
END $$;

-- invoices --------------------------------------------------------------------
DO $$ BEGIN
  CREATE POLICY "invoices_authenticated_access"
    ON public.invoices
    FOR ALL
    TO authenticated
    USING  (true)
    WITH CHECK (true);
  RAISE NOTICE 'Policy created on invoices.';
EXCEPTION WHEN undefined_table THEN
  RAISE NOTICE 'Table invoices does not exist – skipping policy.';
END $$;

-- invoice_items ---------------------------------------------------------------
DO $$ BEGIN
  CREATE POLICY "invoice_items_authenticated_access"
    ON public.invoice_items
    FOR ALL
    TO authenticated
    USING  (true)
    WITH CHECK (true);
  RAISE NOTICE 'Policy created on invoice_items.';
EXCEPTION WHEN undefined_table THEN
  RAISE NOTICE 'Table invoice_items does not exist – skipping policy.';
END $$;

-- payments --------------------------------------------------------------------
DO $$ BEGIN
  CREATE POLICY "payments_authenticated_access"
    ON public.payments
    FOR ALL
    TO authenticated
    USING  (true)
    WITH CHECK (true);
  RAISE NOTICE 'Policy created on payments.';
EXCEPTION WHEN undefined_table THEN
  RAISE NOTICE 'Table payments does not exist – skipping policy.';
END $$;

-- products --------------------------------------------------------------------
DO $$ BEGIN
  CREATE POLICY "products_authenticated_access"
    ON public.products
    FOR ALL
    TO authenticated
    USING  (true)
    WITH CHECK (true);
  RAISE NOTICE 'Policy created on products.';
EXCEPTION WHEN undefined_table THEN
  RAISE NOTICE 'Table products does not exist – skipping policy.';
END $$;


-- ── 5c. USER_SETTINGS (row-level per user) ─────────────────────────────────
-- Users can only SELECT, INSERT, UPDATE their OWN settings row.
-- No DELETE – settings rows are managed by the system.

-- Select own settings
CREATE POLICY "user_settings_select_own"
  ON public.user_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert own settings (e.g. first login creates a row)
CREATE POLICY "user_settings_insert_own"
  ON public.user_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Update own settings
CREATE POLICY "user_settings_update_own"
  ON public.user_settings
  FOR UPDATE
  TO authenticated
  USING   (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ── 5d. USER_ROLES (read own + admin manages all) ──────────────────────────

-- Every user can read their own role (needed for the app to know permissions)
CREATE POLICY "user_roles_select_own"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can see ALL roles (needed for user management UI)
CREATE POLICY "user_roles_select_admin"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Admins can update any role (approve users, change roles)
CREATE POLICY "user_roles_update_admin"
  ON public.user_roles
  FOR UPDATE
  TO authenticated
  USING   (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins can insert new role rows
CREATE POLICY "user_roles_insert_admin"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Admins can delete role rows
CREATE POLICY "user_roles_delete_admin"
  ON public.user_roles
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Allow the trigger function (SECURITY DEFINER) to insert rows for new signups.
-- The handle_new_user trigger runs as the function owner, which bypasses RLS,
-- so no extra policy is needed for that path.


-- ════════════════════════════════════════════════════════════════════════════
-- STEP 6 · AUTO-APPROVE all existing users in user_roles
-- Any user who already has a row gets approved immediately so they're not
-- locked out after this migration.
-- ════════════════════════════════════════════════════════════════════════════

-- Make sure the is_approved column exists
DO $$ BEGIN
  ALTER TABLE public.user_roles ADD COLUMN is_approved BOOLEAN DEFAULT true;
  RAISE NOTICE 'Added is_approved column to user_roles.';
EXCEPTION WHEN duplicate_column THEN
  RAISE NOTICE 'is_approved column already exists on user_roles – skipping.';
END $$;

-- Make sure the status column exists (frontend queries this)
DO $$ BEGIN
  ALTER TABLE public.user_roles ADD COLUMN status TEXT DEFAULT 'approved';
  RAISE NOTICE 'Added status column to user_roles.';
EXCEPTION WHEN duplicate_column THEN
  RAISE NOTICE 'status column already exists on user_roles – skipping.';
END $$;

-- Make sure the email column exists (frontend displays this)
DO $$ BEGIN
  ALTER TABLE public.user_roles ADD COLUMN email TEXT;
  RAISE NOTICE 'Added email column to user_roles.';
EXCEPTION WHEN duplicate_column THEN
  RAISE NOTICE 'email column already exists on user_roles – skipping.';
END $$;

-- Set all existing rows to approved (both columns)
UPDATE public.user_roles SET is_approved = true WHERE is_approved IS NOT true;
UPDATE public.user_roles SET status = 'approved' WHERE status != 'approved' OR status IS NULL;


-- ════════════════════════════════════════════════════════════════════════════
-- STEP 7 · handle_new_user() trigger
-- Automatically creates a user_roles row for every new signup so they can
-- access data immediately (auto-approved with role = 'user').
-- ════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, email, role, status, is_approved)
  VALUES (NEW.id, NEW.email, 'user', 'approved', true)
  ON CONFLICT (user_id) DO NOTHING;   -- idempotent: don't fail if row exists
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.handle_new_user() IS
  'Trigger function: auto-creates an approved user_roles row on signup.';

-- Drop existing trigger if present so we can recreate it cleanly.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ════════════════════════════════════════════════════════════════════════════
-- STEP 8 · BACKFILL user_roles for any auth.users who don't have a row yet
-- This catches users who signed up before user_roles existed.
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO public.user_roles (user_id, email, role, status, is_approved)
SELECT id, email, 'user', 'approved', true
  FROM auth.users
 WHERE id NOT IN (SELECT user_id FROM public.user_roles)
ON CONFLICT (user_id) DO NOTHING;


-- ════════════════════════════════════════════════════════════════════════════
-- STEP 9 · GRANT necessary permissions to the authenticated and anon roles
-- Supabase uses these Postgres roles for its JWT-based auth.
-- ════════════════════════════════════════════════════════════════════════════

-- Shared data tables: full CRUD for authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers            TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales                TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.remarks              TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks                TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.goals                TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.milestones           TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.historical_snapshots TO authenticated;

-- User-specific tables
GRANT SELECT, INSERT, UPDATE        ON public.user_settings         TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles           TO authenticated;

-- Optional tables (safe grants – errors are swallowed if table doesn't exist)
DO $$ BEGIN
  EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_territories TO authenticated';
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
  EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated';
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
  EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_items TO authenticated';
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
  EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated';
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
  EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated';
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- Grant USAGE on sequences so INSERT with serial/identity columns works
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant execute on helper functions
GRANT EXECUTE ON FUNCTION public.is_admin()          TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_approved_user()  TO authenticated;


-- ════════════════════════════════════════════════════════════════════════════
-- STEP 10 · VERIFICATION QUERIES (run these manually to confirm)
-- ════════════════════════════════════════════════════════════════════════════

-- Uncomment and run these after the migration to verify everything is correct:
--
-- List all policies in the public schema:
--   SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
--     FROM pg_policies
--    WHERE schemaname = 'public'
--    ORDER BY tablename, policyname;
--
-- Check RLS is enabled on all tables:
--   SELECT relname, relrowsecurity
--     FROM pg_class
--    WHERE relnamespace = 'public'::regnamespace
--      AND relkind = 'r'
--    ORDER BY relname;
--
-- Check all users are approved:
--   SELECT * FROM public.user_roles;

COMMIT;

-- ════════════════════════════════════════════════════════════════════════════
-- DONE!
-- After running this migration:
--   1. Authenticated users will be able to see and modify all shared CRM data
--   2. Users will only see their own settings
--   3. Admins can manage user roles
--   4. New signups are auto-approved with role = 'user'
--   5. All existing users have been retroactively approved
-- ════════════════════════════════════════════════════════════════════════════
