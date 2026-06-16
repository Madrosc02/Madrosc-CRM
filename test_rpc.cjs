require('dotenv').config({ path: '.env.development' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testRPC() {
    const { data, error } = await supabase.rpc('is_approved_user');
    console.log("is_approved_user returned:", data, "error:", error);
}

testRPC();
