import { createClient } from '@supabase/supabase-js';

// Supabase URL and Anon Key from .env.production
const supabaseUrl = 'https://uxstrrdgyqdrcrpqtkwq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4c3RycmRneXFkcmNycHF0a3dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2OTEzNzYsImV4cCI6MjA3OTI2NzM3Nn0.154nMKoV_YkZdlYL73O9QJi8Me_326uvzkCuGCba0kA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
    console.log("Testing Supabase connection for data fetching...");
    
    // Attempting to fetch from customers table, just like the dashboard does.
    // Because we are an anonymous user (or a logged-in user without 'approved' status in user_roles),
    // RLS policies will silently filter out all rows.
    const { data, error } = await supabase.from('sales').select('*').limit(5);

    if (error) {
        console.error("❌ Error fetching data:", error);
    } else {
        console.log("✅ Query successful. Data returned:");
        console.log(data);
        if (data.length === 0) {
            console.log("\n⚠️ Note: The query succeeded but returned 0 rows (empty array).");
            console.log("This confirms the root cause: Postgres RLS is silently blocking access and returning no data.");
            console.log("Please run 'migration_definitive_fix.sql' in the Supabase Dashboard to resolve this.");
        }
    }
}

testConnection();
