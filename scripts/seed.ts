import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env.development
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.development') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
// WARNING: Seeding requires the Service Role Key to bypass RLS policies!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.development");
  console.warn("Please set these variables in your environment to execute the seed script.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
  console.log('Seeding Sales Executives...');
  const { data: executives, error: execError } = await supabase.from('sales_executives').insert([
    { name: 'Arjun Mehta', contact_number: '9876543210' },
    { name: 'Kavita Roy', contact_number: '9876543211' },
    { name: 'Siddharth Bose', contact_number: '9876543212' }
  ]).select();

  if (execError) throw execError;
  console.log(`Inserted ${executives.length} Sales Executives.`);

  console.log('Seeding Franchise Clients...');
  const clientsToInsert = [];
  for (let i = 1; i <= 15; i++) {
    const randomExec = executives[Math.floor(Math.random() * executives.length)];
    clientsToInsert.push({
      business_name: `Franchise Client ${i}`,
      contact_person: `Contact Person ${i}`,
      phone_whatsapp: `99988877${i.toString().padStart(2, '0')}`,
      email: `client${i}@franchise.com`,
      assigned_executive_id: randomExec.id
    });
  }

  const { data: clients, error: clientError } = await supabase.from('franchise_clients').insert(clientsToInsert).select();
  if (clientError) throw clientError;
  console.log(`Inserted ${clients.length} Franchise Clients.`);

  console.log('Seeding Interaction Logs...');
  const logsToInsert = [];
  const channels = ['WhatsApp', 'Call', 'Email'];
  for (const client of clients) {
    // Generate 1-3 interaction logs per client
    const numLogs = Math.floor(Math.random() * 3) + 1;
    for (let j = 0; j < numLogs; j++) {
      logsToInsert.push({
        client_id: client.id,
        channel: channels[Math.floor(Math.random() * channels.length)],
        interaction_notes: `Follow-up ${j + 1} regarding post-sales support.`
      });
    }
  }
  
  const { error: logError } = await supabase.from('interaction_logs').insert(logsToInsert);
  if (logError) throw logError;
  console.log(`Inserted ${logsToInsert.length} Interaction Logs.`);

  console.log('Seeding Loyalty Ledgers...');
  const ledgersToInsert = [];
  for (const client of clients) {
    // Add standard bonus points
    ledgersToInsert.push({
      franchise_client_id: client.id,
      transaction_type: 'Bonus',
      points: 500,
      description: 'Standard Order Bonus Addition'
    });
    
    // Add a negative calculation penalty for a few
    if (Math.random() > 0.5) {
      ledgersToInsert.push({
        franchise_client_id: client.id,
        transaction_type: 'Penalty',
        points: -100,
        description: 'Negative point calculation penalty (Order return)'
      });
    }
  }

  const { error: ledgerError } = await supabase.from('loyalty_ledgers').insert(ledgersToInsert);
  if (ledgerError) throw ledgerError;
  console.log(`Inserted ${ledgersToInsert.length} loyalty transactions.`);

  console.log('Seeding completed successfully!');
}

seed().catch(console.error);
