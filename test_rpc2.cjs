require('dotenv').config({ path: '.env.development' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testRPC() {
    const { data: adminData, error: adminErr } = await supabase.rpc('is_admin');
    console.log("is_admin returned:", adminData, "error:", adminErr);
    
    // Let's also fetch customers and see what we get
    const { data: custData, error: custErr } = await supabase.from('customers').select('id');
    console.log(`Customers returned: ${custData ? custData.length : 0} error:`, custErr);
}

testRPC();
