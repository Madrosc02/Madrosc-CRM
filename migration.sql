-- ============================================
-- Multi-District Support Migration
-- Creates customer_territories table
-- ============================================

-- Step 1: Create customer_territories table
CREATE TABLE IF NOT EXISTS customer_territories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    monopoly_status TEXT NOT NULL DEFAULT 'Non-Monopoly',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_territories_customer 
ON customer_territories(customer_id);

CREATE INDEX IF NOT EXISTS idx_territories_district 
ON customer_territories(district, monopoly_status);

CREATE INDEX IF NOT EXISTS idx_territories_state 
ON customer_territories(state);

-- Step 3: Migrate existing data from customers table
-- Copy each customer's current district as their first territory
INSERT INTO customer_territories (customer_id, state, district, monopoly_status)
SELECT 
    id,
    state,
    district,
    monopoly_status
FROM customers
WHERE id NOT IN (SELECT DISTINCT customer_id FROM customer_territories);

-- Step 4: Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 5: Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_customer_territories_updated_at ON customer_territories;
CREATE TRIGGER update_customer_territories_updated_at
    BEFORE UPDATE ON customer_territories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 6: Verify migration
SELECT 
    c.id,
    c.firm_name,
    c.state as old_state,
    c.district as old_district,
    COUNT(ct.id) as territory_count
FROM customers c
LEFT JOIN customer_territories ct ON c.id = ct.customer_id
GROUP BY c.id, c.firm_name, c.state, c.district
ORDER BY c.firm_name
LIMIT 10;
