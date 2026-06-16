require('dotenv').config({ path: '.env.development' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkPolicies() {
    // We can't query pg_policies via standard supabase-js client because it's not exposed via PostgREST
    // But we can test authenticated vs anon behavior.
    
    // Test anon
    const { data: anonData } = await supabase.from('customers').select('id');
    console.log(`Anon fetch returned: ${anonData ? anonData.length : 0} customers`);
    
    // Try to login as the user if we can, or just check the user_roles table
    const { data: roles } = await supabase.from('user_roles').select('*');
    console.log("Roles table:", roles);
}

checkPolicies();
