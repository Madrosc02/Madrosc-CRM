# Manual Fix Instructions for Data Loading Issue

## Root Cause Analysis
The issue where the UI loads but fails to fetch or display data is caused by an **RLS (Row Level Security) policy mismatch** on the Supabase backend.
- Users who signed up before certain database triggers were created do not have a row in the `user_roles` table.
- The React frontend explicitly catches the `PGRST116` (no rows) error in `AuthContext.tsx` and treats the user as `approved`, allowing them into the dashboard.
- However, the Postgres database enforces `is_approved_user()`, which requires an exact match in the `user_roles` table with `status = 'approved'`.
- Because the legacy user has no row, Postgres silently blocks all `SELECT` queries without throwing an error (returning `[]`). This results in the dashboard displaying 0 customers and 0 sales.

## Step-by-Step Fix via Supabase Dashboard

To fix this, you must run the provided definitive fix script on your production Supabase database. This will auto-approve legacy users and relax the restrictive RLS policies so data loads correctly.

1. Log into your [Supabase Dashboard](https://app.supabase.com/).
2. Select your project: `uxstrrdgyqdrcrpqtkwq` (Madrosc-CRM).
3. On the left sidebar, click on the **SQL Editor** (the terminal icon).
4. Click **New Query**.
5. Open the `migration_definitive_fix.sql` file in your code editor from your project root directory (`c:\Users\MIR MEHRAJ\OneDrive\Desktop\My CRM\migration_definitive_fix.sql`).
6. Copy the entire contents of `migration_definitive_fix.sql`.
7. Paste the contents into the Supabase SQL Editor.
8. Click the **Run** button (or press `Cmd/Ctrl + Enter`).
9. After the script runs successfully, refresh the `crm.medrosc.com` page. The data will now fetch and display correctly.

## Verifying the Issue
We have provided a script `test_supabase_connection.js` in the project root. It simulates a production data fetch. Since the RLS is blocking access for users without a role, it will currently return `[]` (empty data) without any explicit error, confirming the root cause. Once the SQL fix is applied, the data will be accessible.
