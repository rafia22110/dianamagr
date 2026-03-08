// Script to create the subscribers table in InsForge
const API_KEY = process.env.INSFORGE_API_KEY;
const BASE_URL = 'https://ane7v4ce.us-east.insforge.app';

if (!API_KEY) {
  console.error('❌ Error: INSFORGE_API_KEY is not set in environment variables.');
  process.exit(1);
}

async function createSubscribersTable() {
    console.log('Creating subscribers table in InsForge...');

    const sql = `
    CREATE TABLE IF NOT EXISTS subscribers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      subscribed_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

    try {
        const response = await fetch(`${BASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
                'apikey': API_KEY,
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: sql }),
        });

        const text = await response.text();
        console.log('Response status:', response.status);
        console.log('Response:', text);

        if (response.ok) {
            console.log('✅ subscribers table created successfully!');
        } else {
            // Try via direct REST insert to check if table exists
            console.log('Trying alternative method...');
            const testResponse = await fetch(`${BASE_URL}/rest/v1/subscribers?limit=1`, {
                headers: {
                    'apikey': API_KEY,
                    'Authorization': `Bearer ${API_KEY}`,
                },
            });
            console.log('Table check status:', testResponse.status);
            const testText = await testResponse.text();
            console.log('Table check response:', testText);
        }
    } catch (e) {
        console.error('Error:', e.message);
    }
}

createSubscribersTable();
