process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const API = 'https://diana-residence.vercel.app/api/insforge';
const KEY = 'ik_bf44df2031c6d8808e0d4cff27b52575';
const H = { 
    'Authorization': `Bearer ${KEY}`,
    'apikey': KEY,
    'Content-Type': 'application/json' 
};

async function createTable() {
  try {
    console.log('Fetching tables from:', `${API}/api/database/tables`);
    const tableRes = await fetch(`${API}/api/database/tables`, { headers: H });
    console.log('Tables status:', tableRes.status);
    const tables = await tableRes.json();
    
    if (tableRes.status !== 200) {
        console.error('Error fetching tables:', tables);
        return;
    }

    const hasMessages = Array.isArray(tables) && tables.some(t => {
        const name = typeof t === 'string' ? t : t.name;
        return name === 'messages';
    });
    
    if (!hasMessages) {
       console.log('Creating messages table...');
       const r = await fetch(`${API}/api/database/tables`, {
           method: 'POST', headers: H,
           body: JSON.stringify({
               name: 'messages',
               columns: [
                   { name: 'id', type: 'uuid', primaryKey: true, defaultValue: 'gen_random_uuid()' },
                   { name: 'name', type: 'text', notNull: true },
                   { name: 'email', type: 'text', notNull: true },
                   { name: 'phone', type: 'text' },
                   { name: 'message', type: 'text' },
                   { name: 'created_at', type: 'timestamptz', defaultValue: 'now()' }
               ]
           })
       });
       const result = await r.json();
       console.log('Creation response status:', r.status);
       console.log('Creation response body:', JSON.stringify(result, null, 2));
    } else {
       console.log('Messages table already exists.');
    }
  } catch(e) {
    console.error('Error', e);
  }
}

createTable();
