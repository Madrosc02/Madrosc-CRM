-- ============================================================
-- FIX: Users stuck in 'pending' status cannot see any data
-- 
-- INSTRUCTIONS: Run this in your Supabase SQL Editor
-- Go to: https://supabase.com/dashboard → Your Project → SQL Editor
-- ============================================================

-- STEP 1: Approve all existing users who are currently 'pending'
-- (they signed up but were never approved)
UPDATE public.user_roles
SET status = 'approved', updated_at = NOW()
WHERE status = 'pending';

-- STEP 2: Check what was updated (for verification)
SELECT user_id, email, role, status FROM public.user_roles ORDER BY created_at DESC;

-- STEP 3: Change the default status for NEW signups to 'approved'
-- so users don't need manual approval each time
ALTER TABLE public.user_roles 
ALTER COLUMN status SET DEFAULT 'approved'::user_status;

-- STEP 4: Update the trigger so new signups are auto-approved
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, email, role, status)
  VALUES (
    new.id, 
    new.email,
    'user',
    'approved'   -- Changed from 'pending' to 'approved' so users can access immediately
  )
  ON CONFLICT (user_id) DO NOTHING;  -- Prevent duplicate entry errors
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 5: Also fix is_approved_user() to allow users NOT in user_roles table
-- (fallback for users created before the trigger was set up)
CREATE OR REPLACE FUNCTION public.is_approved_user()
RETURNS BOOLEAN AS $$
BEGIN
  -- Allow access if: user has an approved record, OR user has NO record at all (legacy user)
  RETURN (
    NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND status = 'approved')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 6: Verify the fix - should show all users as 'approved'
SELECT 
  ur.email, 
  ur.role, 
  ur.status,
  ur.updated_at
FROM public.user_roles ur
ORDER BY ur.updated_at DESC;
