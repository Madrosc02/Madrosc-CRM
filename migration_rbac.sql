-- Create the enum types for roles and statuses
CREATE TYPE user_role AS ENUM ('admin', 'user');
CREATE TYPE user_status AS ENUM ('pending', 'approved', 'rejected');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email TEXT,
    role user_role DEFAULT 'user',
    status user_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Helper function to check if the current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if the current user is approved
CREATE OR REPLACE FUNCTION public.is_approved_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND status = 'approved'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for user_roles
-- 1. Users can read their own role
CREATE POLICY "Users can read own role" 
ON public.user_roles FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Admins can read all roles
CREATE POLICY "Admins can read all roles" 
ON public.user_roles FOR SELECT 
USING (public.is_admin());

-- 3. Admins can update roles
CREATE POLICY "Admins can update roles" 
ON public.user_roles FOR UPDATE 
USING (public.is_admin());

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, email, role, status)
  VALUES (
    new.id, 
    new.email,
    'user', 
    'pending'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call handle_new_user on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update existing policies on core tables to require approval
-- Note: You should drop old policies first or alter them.
-- For safety, we will just add a check to the tables.
-- A cleaner way is dropping the 'Allow authenticated access' policies and recreating them.
-- But since we don't know if they were modified, we will provide the drop statements for standard tables.

DROP POLICY IF EXISTS "Allow authenticated access" ON public.customers;
CREATE POLICY "Allow authenticated access" ON public.customers FOR ALL USING (auth.role() = 'authenticated' AND public.is_approved_user());

DROP POLICY IF EXISTS "Allow authenticated access" ON public.sales;
CREATE POLICY "Allow authenticated access" ON public.sales FOR ALL USING (auth.role() = 'authenticated' AND public.is_approved_user());

DROP POLICY IF EXISTS "Allow authenticated access" ON public.remarks;
CREATE POLICY "Allow authenticated access" ON public.remarks FOR ALL USING (auth.role() = 'authenticated' AND public.is_approved_user());

DROP POLICY IF EXISTS "Allow authenticated access" ON public.tasks;
CREATE POLICY "Allow authenticated access" ON public.tasks FOR ALL USING (auth.role() = 'authenticated' AND public.is_approved_user());

DROP POLICY IF EXISTS "Allow authenticated access" ON public.goals;
CREATE POLICY "Allow authenticated access" ON public.goals FOR ALL USING (auth.role() = 'authenticated' AND public.is_approved_user());

DROP POLICY IF EXISTS "Allow authenticated access" ON public.milestones;
CREATE POLICY "Allow authenticated access" ON public.milestones FOR ALL USING (auth.role() = 'authenticated' AND public.is_approved_user());
