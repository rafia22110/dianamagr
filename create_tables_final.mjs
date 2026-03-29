import { createClient } from '@insforge/sdk';

const API = 'https://ane7v4ce.us-east.insforge.app';
const KEY = 'ik_bf44df2031c6d8808e0d4cff27b52575'; // Anon key from the lib/insforge.ts

async function setup() {
    console.log('🚀 Checking/Creating tables...');
    const H = { 
        'apikey': KEY,
        'Authorization': `Bearer ${KEY}`, 
        'Content-Type': 'application/json' 
    };

    const tables = [
        {
            name: 'messages',
            columns: [
                { name: 'id', type: 'uuid', primaryKey: true, defaultValue: 'gen_random_uuid()' },
                { name: 'name', type: 'text', notNull: true },
                { name: 'email', type: 'text', notNull: true },
                { name: 'phone', type: 'text' },
                { name: 'message', type: 'text' },
                { name: 'created_at', type: 'timestamptz', defaultValue: 'now()' }
            ]
        },
        {
            name: 'links',
            columns: [
                { name: 'id', type: 'uuid', primaryKey: true, defaultValue: 'gen_random_uuid()' },
                { name: 'title', type: 'text', notNull: true },
                { name: 'description', type: 'text' },
                { name: 'url', type: 'text', notNull: true },
                { name: 'icon', type: 'text' },
                { name: 'type', type: 'text', defaultValue: "'Video'" },
                { name: 'display_order', type: 'int4', defaultValue: '0' },
                { name: 'created_at', type: 'timestamptz', defaultValue: 'now()' }
            ]
        }
    ];

    for (const table of tables) {
        try {
            console.log(`Creating ${table.name}...`);
            const r = await fetch(`${API}/api/database/tables`, {
                method: 'POST',
                headers: H,
                body: JSON.stringify(table)
            });
            const d = await r.json();
            console.log(`Result (${table.name}):`, r.status, d);
        } catch (e) {
            console.error(`Error creating ${table.name}:`, e.message);
        }
    }
}

setup();
