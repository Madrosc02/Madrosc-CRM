-- Migration: Add Tags to Customers Table
-- Description: Adds a tags text array column to support custom categorization.

ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Optional: Add an index on tags for faster filtering if they get large
CREATE INDEX IF NOT EXISTS idx_customers_tags ON public.customers USING GIN (tags);
