// Script to update the subscribers table to support passwords
const API_KEY = process.env.INSFORGE_API_KEY;

if (!API_KEY) {
  console.error("❌ Error: INSFORGE_API_KEY is not set in environment variables.");
  process.exit(1);
}

const BASE_URL = 'https://ane7v4ce.us-east.insforge.app';

async function updateSubscribersTable() {
    console.log('Updating subscribers table to add password_hash column...');

    const sql = `
    ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS password_hash TEXT;
    ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS reset_token TEXT;
    ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMPTZ;
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
            console.log('✅ subscribers table updated successfully!');
        } else {
            console.error('Failed to update table');
        }
    } catch (e) {
        console.error('Error:', e.message);
    }
}

updateSubscribersTable();
