-- 1. Create Sale Transaction
CREATE OR REPLACE FUNCTION create_sale_txn(
    p_customer_id UUID,
    p_amount DECIMAL,
    p_date DATE
) RETURNS UUID AS $$
DECLARE
    v_sale_id UUID;
BEGIN
    INSERT INTO public.sales (customer_id, amount, date)
    VALUES (p_customer_id, p_amount, p_date)
    RETURNING id INTO v_sale_id;

    UPDATE public.customers
    SET last_updated = timezone('utc'::text, now())
    WHERE id = p_customer_id;

    RETURN v_sale_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create Payment Transaction
CREATE OR REPLACE FUNCTION create_payment_txn(
    p_customer_id UUID,
    p_amount DECIMAL,
    p_date DATE,
    p_payment_mode TEXT,
    p_reference_no TEXT,
    p_remark TEXT
) RETURNS UUID AS $$
DECLARE
    v_payment_id UUID;
BEGIN
    -- Insert payment
    INSERT INTO public.payments (customer_id, amount, date, payment_mode, reference_no)
    VALUES (p_customer_id, p_amount, p_date, p_payment_mode, p_reference_no)
    RETURNING id INTO v_payment_id;

    -- Update balance
    UPDATE public.customers
    SET outstanding_balance = COALESCE(outstanding_balance, 0) - p_amount,
        last_updated = timezone('utc'::text, now())
    WHERE id = p_customer_id;

    -- Insert remark
    IF p_remark IS NOT NULL THEN
        INSERT INTO public.remarks (customer_id, remark, "user", timestamp)
        VALUES (p_customer_id, p_remark, 'Sales Team', timezone('utc'::text, now()));
    END IF;

    RETURN v_payment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create Invoice Transaction
CREATE OR REPLACE FUNCTION create_invoice_txn(
    p_customer_id UUID, 
    p_invoice_no TEXT, 
    p_date DATE, 
    p_total_amount DECIMAL, 
    p_pdf_url TEXT, 
    p_items JSON,
    p_remark TEXT
) RETURNS UUID AS $$
DECLARE
    v_invoice_id UUID;
    item JSON;
BEGIN
    -- Insert invoice
    INSERT INTO public.invoices (customer_id, invoice_no, date, total_amount, pdf_url)
    VALUES (p_customer_id, p_invoice_no, p_date, p_total_amount, p_pdf_url)
    RETURNING id INTO v_invoice_id;

    -- Insert items
    IF p_items IS NOT NULL THEN
        FOR item IN SELECT * FROM json_array_elements(p_items)
        LOOP
            INSERT INTO public.invoice_items (invoice_id, product_name, pack, quantity, rate, amount)
            VALUES (
                v_invoice_id, 
                (item->>'product_name')::TEXT, 
                (item->>'pack')::TEXT, 
                (item->>'quantity')::DECIMAL, 
                (item->>'rate')::DECIMAL, 
                (item->>'amount')::DECIMAL
            );
        END LOOP;
    END IF;

    -- Update balance
    UPDATE public.customers
    SET outstanding_balance = COALESCE(outstanding_balance, 0) + p_total_amount,
        last_updated = timezone('utc'::text, now())
    WHERE id = p_customer_id;

    -- Insert remark
    IF p_remark IS NOT NULL THEN
        INSERT INTO public.remarks (customer_id, remark, "user", timestamp)
        VALUES (p_customer_id, p_remark, 'Sales Team', timezone('utc'::text, now()));
    END IF;

    RETURN v_invoice_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create Bill Transaction
CREATE OR REPLACE FUNCTION create_bill_txn(
    p_customer_id UUID,
    p_amount DECIMAL,
    p_remark TEXT
) RETURNS void AS $$
BEGIN
    -- Update balance
    UPDATE public.customers
    SET outstanding_balance = COALESCE(outstanding_balance, 0) + p_amount,
        last_updated = timezone('utc'::text, now())
    WHERE id = p_customer_id;

    -- Insert remark
    IF p_remark IS NOT NULL THEN
        INSERT INTO public.remarks (customer_id, remark, "user", timestamp)
        VALUES (p_customer_id, p_remark, 'Sales Team', timezone('utc'::text, now()));
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
