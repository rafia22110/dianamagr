import { createClient } from '@insforge/sdk';

const API = 'https://ane7v4ce.us-east.insforge.app';
const KEY = 'ik_bf44df2031c6d8808e0d4cff27b52575'; // Anon key from the lib/insforge.ts

console.log('🚀 Creating subscribers table...');

async function setup() {
    try {
        const H = { 
            'apikey': KEY,
            'Authorization': `Bearer ${KEY}`, 
            'Content-Type': 'application/json' 
        };

        const r = await fetch(`${API}/api/database/tables`, {
            method: 'POST',
            headers: H,
            body: JSON.stringify({
                name: 'subscribers',
                columns: [
                    { name: 'id', type: 'uuid', primaryKey: true, defaultValue: 'gen_random_uuid()' },
                    { name: 'name', type: 'text' },
                    { name: 'email', type: 'text', notNull: true, unique: true },
                    { name: 'phone', type: 'text' },
                    { name: 'subscribed_at', type: 'timestamptz', defaultValue: 'now()' }
                ]
            })
        });

        const d = await r.json();
        console.log('Result:', r.status, d);
    } catch (e) {
        console.error('Error:', e);
    }
}

setup();
