import { supabase } from '../src/lib/supabase';

async function testInsert() {
  const formData = {
    firmName: "Test Firm",
    personName: "Test Person",
    contact: "1234567890",
    state: "Haryana",
    district: "Nuh",
    tier: "Bronze",
    monopolyStatus: "Non-Monopoly",
  };

  const { data, error } = await supabase
    .from('customers')
    .insert([{
        name: formData.firmName,
        firm_name: formData.firmName,
        person_name: formData.personName,
        contact: formData.contact,
        tier: formData.tier,
        monopoly_status: formData.monopolyStatus,
        state: formData.state,
        district: formData.district,
        last_updated: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error("SUPABASE ERROR:", error);
  } else {
    console.log("SUCCESS:", data);
  }
}

testInsert();
