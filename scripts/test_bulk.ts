import { supabase } from '../src/lib/supabase';

async function testBulkInsert() {
  const c = {
        firmName: "Test Bulk Firm",
        personName: "Test Bulk Person",
        email: "",
        contact: "1234567891",
        alternateContact: "",
        tier: "Bronze",
        monopolyStatus: "Non-Monopoly",
        state: "Haryana",
        district: "Nuh",
        salesThisMonth: 0,
        avg6MoSales: 0,
        outstandingBalance: 0,
        daysSinceLastOrder: 0,
  };

  const dbData = [{
        name: c.firmName, 
        firm_name: c.firmName,
        person_name: c.personName,
        email: c.email,
        contact: c.contact,
        alternate_contact: c.alternateContact,
        tier: c.tier,
        monopoly_status: c.monopolyStatus,
        state: c.state,
        district: c.district,
        sales_this_month: c.salesThisMonth,
        avg_6_mo_sales: c.avg6MoSales,
        outstanding_balance: c.outstandingBalance,
        days_since_last_order: c.daysSinceLastOrder,
        last_updated: new Date().toISOString(),
        avatar: `https://i.pravatar.cc/150?u=${Math.random()}`
    }];

  const { data, error } = await supabase
    .from('customers')
    .insert(dbData)
    .select();

  if (error) {
    console.error("BULK SUPABASE ERROR:", error);
  } else {
    console.log("BULK SUCCESS:", data);
  }
}

testBulkInsert();
