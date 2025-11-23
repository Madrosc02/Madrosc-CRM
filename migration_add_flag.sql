ALTER TABLE customers ADD COLUMN flag TEXT CHECK (flag IN ('Green', 'Red'));
