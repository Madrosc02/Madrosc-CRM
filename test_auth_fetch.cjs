require('dotenv').config({ path: '.env.development' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testAuthFetch() {
    const email = `test_${Date.now()}@example.com`;
    const password = 'TestPassword123!';
    
    console.log(`Signing up ${email}...`);
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email,
        password,
    });
    
    if (signUpErr) {
        console.error("Signup failed:", signUpErr.message);
        return;
    }
    
    console.log("Signup success! Fetching customers as authenticated user...");
    const { data: custData, error: custErr } = await supabase.from('customers').select('id');
    console.log(`Customers returned: ${custData ? custData.length : 0} error:`, custErr);
}

testAuthFetch();
