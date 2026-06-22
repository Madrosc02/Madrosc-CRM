const { createClient } = require('@supabase/supabase-js');

const s = createClient(
  'https://uxstrrdgyqdrcrpqtkwq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4c3RycmRneXFkcmNycHF0a3dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2OTEzNzYsImV4cCI6MjA3OTI2NzM3Nn0.154nMKoV_YkZdlYL73O9QJi8Me_326uvzkCuGCba0kA'
);

async function main() {
  // Test 1: Basic customer fetch (same as frontend api.fetchCustomers)
  console.log("=== Test 1: Customers (anon) ===");
  const { data: custs, error: custErr } = await s
    .from('customers')
    .select('*')
    .order('last_updated', { ascending: false })
    .limit(3);
  console.log("Count:", custs ? custs.length : 0);
  console.log("Error:", custErr);
  if (custs && custs[0]) {
    console.log("Sample:", custs[0].firm_name, "sales_this_month:", custs[0].sales_this_month);
  }

  // Test 2: Sign in as a test user
  console.log("\n=== Test 2: Sign in & test ===");
  const { data: authData, error: authErr } = await s.auth.signInWithPassword({
    email: 'madroscpharma@gmail.com',
    password: 'Madrosc@123'
  });
  
  if (authErr) {
    console.log("Auth error:", authErr.message);
    // Try another possible email
    const { data: authData2, error: authErr2 } = await s.auth.signInWithPassword({
      email: 'admin@madrosc.com',
      password: 'Madrosc@123'
    });
    if (authErr2) {
      console.log("Second auth error:", authErr2.message);
      console.log("Cannot test authenticated flow without credentials");
      return;
    }
    console.log("Signed in as:", authData2.user.email);
  } else {
    console.log("Signed in as:", authData.user.email);
  }
  
  // Test 3: Fetch customers as authenticated user
  console.log("\n=== Test 3: Customers (authenticated) ===");
  const { data: authCusts, error: authCustErr } = await s
    .from('customers')
    .select('*')
    .order('last_updated', { ascending: false });
  console.log("Count:", authCusts ? authCusts.length : 0);
  console.log("Error:", authCustErr);

  // Test 4: user_roles
  console.log("\n=== Test 4: User roles ===");
  const { data: roles, error: rolesErr } = await s
    .from('user_roles')
    .select('role, status')
    .single();
  console.log("Roles:", roles);
  console.log("Error:", rolesErr);

  // Test 5: user_settings
  console.log("\n=== Test 5: User settings ===");
  const { data: settings, error: settingsErr } = await s
    .from('user_settings')
    .select('*')
    .maybeSingle();
  console.log("Settings:", settings);
  console.log("Error:", settingsErr);

  // Test 6: Products
  console.log("\n=== Test 6: Products ===");
  const { data: prods, error: prodsErr } = await s
    .from('products')
    .select('*')
    .limit(3);
  console.log("Count:", prods ? prods.length : 0);
  console.log("Error:", prodsErr);

  // Test 7: Tasks
  console.log("\n=== Test 7: Tasks ===");
  const { data: tasks, error: tasksErr } = await s
    .from('tasks')
    .select('*');
  console.log("Count:", tasks ? tasks.length : 0);
  console.log("Error:", tasksErr);
  
  // Test 8: invoices table
  console.log("\n=== Test 8: Invoices ===");
  const { data: inv, error: invErr } = await s
    .from('invoices')
    .select('*');
  console.log("Count:", inv ? inv.length : 0);
  console.log("Error:", invErr);

  // Test 9: payments table
  console.log("\n=== Test 9: Payments ===");
  const { data: pay, error: payErr } = await s
    .from('payments')
    .select('*');
  console.log("Count:", pay ? pay.length : 0);
  console.log("Error:", payErr);
}

main().catch(e => console.error("Fatal:", e));
