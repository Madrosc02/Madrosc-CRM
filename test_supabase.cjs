require('dotenv').config({ path: '.env.development' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkData() {
    console.log("Checking customers...");
    const { data: customers, error: cErr } = await supabase.from('customers').select('id');
    if (cErr) console.error("Customers error:", cErr);
    else console.log(`Found ${customers.length} customers.`);

    console.log("Checking products...");
    const { data: products, error: pErr } = await supabase.from('products').select('id');
    if (pErr) console.error("Products error:", pErr);
    else console.log(`Found ${products.length} products.`);
}

checkData();
