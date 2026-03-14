const API = process.env.NEXT_PUBLIC_INSFORGE_URL || 'https://ane7v4ce.us-east.insforge.app';
const KEY = process.env.INSFORGE_API_KEY;

if (!KEY) {
    console.error('❌ Error: INSFORGE_API_KEY is not set in environment variables.');
    process.exit(1);
}

const H = { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' };

const ok = (s) => `\x1b[32m✅ ${s}\x1b[0m`;
const err = (s) => `\x1b[31m❌ ${s}\x1b[0m`;
const inf = (s) => `\x1b[36mℹ  ${s}\x1b[0m`;

async function setup() {
    console.log('\n\x1b[1m🚀 InsForge Setup - Diana Rachmani\x1b[0m\n');

    // 1 – Check existing tables
    console.log(inf('בודק טבלאות קיימות...'));
    const tRes = await fetch(`${API}/api/database/tables`, { headers: H });
    const tables = await tRes.json();
    const tableNames = Array.isArray(tables) ? tables.map(t => t.name || t) : [];
    console.log(inf(`טבלאות נמצאות: ${tableNames.join(', ')}`));

    // 2 – Create/Update tables
    const tablesToCreate = [
        {
            name: 'images',
            columns: [
                { name: 'id', type: 'uuid', primaryKey: true, defaultValue: 'gen_random_uuid()' },
                { name: 'filename', type: 'text', notNull: true },
                { name: 'original_name', type: 'text', notNull: true },
                { name: 'category', type: 'text', notNull: true, defaultValue: "'gallery'" },
                { name: 'tags', type: 'jsonb', defaultValue: "'[]'" },
                { name: 'alt_text', type: 'text' },
                { name: 'storage_path', type: 'text' },
                { name: 'url', type: 'text' },
                { name: 'upload_date', type: 'timestamptz', defaultValue: 'now()' }
            ]
        },
        {
            name: 'subscribers',
            columns: [
                { name: 'id', type: 'uuid', primaryKey: true, defaultValue: 'gen_random_uuid()' },
                { name: 'name', type: 'text' },
                { name: 'email', type: 'text', notNull: true, unique: true },
                { name: 'phone', type: 'text' },
                { name: 'subscribed_at', type: 'timestamptz', defaultValue: 'now()' },
                { name: 'password_hash', type: 'text' },
                { name: 'reset_token', type: 'text' },
                { name: 'reset_token_expiry', type: 'timestamptz' }
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
                { name: 'type', type: 'text' },
                { name: 'display_order', type: 'integer' }
            ]
        },
        {
            name: 'workshops',
            columns: [
                { name: 'id', type: 'uuid', primaryKey: true, defaultValue: 'gen_random_uuid()' },
                { name: 'title', type: 'text', notNull: true },
                { name: 'description', type: 'text' },
                { name: 'date', type: 'timestamptz' },
                { name: 'price', type: 'numeric' },
                { name: 'is_active', type: 'boolean', defaultValue: 'true' }
            ]
        },
        {
            name: 'orders',
            columns: [
                { name: 'id', type: 'uuid', primaryKey: true, defaultValue: 'gen_random_uuid()' },
                { name: 'customer_name', type: 'text' },
                { name: 'customer_email', type: 'text' },
                { name: 'total_amount', type: 'numeric' },
                { name: 'status', type: 'text' },
                { name: 'created_at', type: 'timestamptz', defaultValue: 'now()' }
            ]
        }
    ];

    for (const table of tablesToCreate) {
        if (tableNames.includes(table.name)) {
            console.log(ok(`טבלת ${table.name} כבר קיימת. במידה וחסרות עמודות (כמו ב-subscribers), יש לעדכן אותן ידנית או להוסיף אותן ב-SQL.`));
            // Attempting to add missing columns to subscribers specifically if it exists
            if (table.name === 'subscribers') {
                console.log(inf('מנסה לוודא עמודות אבטחה ב-subscribers...'));
                try {
                    await fetch(`${API}/api/database/tables/${table.name}/columns`, {
                        method: 'POST', headers: H,
                        body: JSON.stringify({ name: 'password_hash', type: 'text' })
                    });
                    await fetch(`${API}/api/database/tables/${table.name}/columns`, {
                        method: 'POST', headers: H,
                        body: JSON.stringify({ name: 'reset_token', type: 'text' })
                    });
                    await fetch(`${API}/api/database/tables/${table.name}/columns`, {
                        method: 'POST', headers: H,
                        body: JSON.stringify({ name: 'reset_token_expiry', type: 'timestamptz' })
                    });
                } catch(e) {}
            }
        } else {
            console.log(inf(`יוצר טבלת ${table.name}...`));
            const r = await fetch(`${API}/api/database/tables`, {
                method: 'POST', headers: H,
                body: JSON.stringify(table)
            });
            if (r.ok || r.status < 400) {
                console.log(ok(`טבלת ${table.name} נוצרה!`));
            } else {
                const d = await r.json();
                console.log(err(`יצירת טבלת ${table.name} נכשלה: ${JSON.stringify(d)}`));
            }
        }
    }

    // 3 – Buckets
    console.log(inf('בודק buckets...'));
    const bRes = await fetch(`${API}/api/storage/buckets`, { headers: H });
    const buckets = await bRes.json();
    const bucketNames = Array.isArray(buckets) ? buckets.map(b => b.name || b) : [];

    if (!bucketNames.includes('diana-images')) {
        console.log(inf('יוצר diana-images bucket...'));
        await fetch(`${API}/api/storage/buckets`, {
            method: 'POST', headers: H,
            body: JSON.stringify({
                name: 'diana-images',
                public: true,
                allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
                maxFileSize: 10485760
            })
        });
        console.log(ok('Bucket נוצר!'));
    } else {
        console.log(ok('Bucket כבר קיים.'));
    }

    console.log('\n' + ok('הסיום הושלם בהצלחה!'));
}

setup().catch(console.error);
