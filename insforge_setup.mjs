const API = 'https://ane7v4ce.us-east.insforge.app';
const KEY = process.env.INSFORGE_API_KEY;

if (!KEY) {
    console.error('\x1b[31m❌ Error: INSFORGE_API_KEY is not set in environment variables.\x1b[0m');
    process.exit(1);
}

const H = { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' };

const ok = (s) => `\x1b[32m✅ ${s}\x1b[0m`;
const err = (s) => `\x1b[31m❌ ${s}\x1b[0m`;
const inf = (s) => `\x1b[36mℹ  ${s}\x1b[0m`;

console.log('\n\x1b[1m🚀 InsForge Setup - Diana Rachmani\x1b[0m\n');

// 1 – Check existing tables
console.log(inf('בודק טבלאות קיימות...'));
const tRes = await fetch(`${API}/api/database/tables`, { headers: H });
const tables = await tRes.json();
const tableNames = Array.isArray(tables) ? tables.map(t => t.name || t) : [];
console.log(inf(`טבלאות נמצאות: ${tableNames.join(', ')}`));

// 2 – Create images table if missing
if (tableNames.includes('images')) {
    console.log(ok('טבלת images כבר קיימת'));
} else {
    console.log(inf('יוצר טבלת images...'));
    const r = await fetch(`${API}/api/database/tables`, {
        method: 'POST', headers: H,
        body: JSON.stringify({
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
        })
    });
    const d = await r.json();
    if (r.ok || r.status < 400) {
        console.log(ok(`טבלת images נוצרה! (${r.status})`));
    } else {
        console.log(err(`יצירת טבלה נכשלה: ${r.status} – ${JSON.stringify(d)}`));
    }
}

// 3 – Check existing buckets
console.log(inf('בודק buckets קיימים...'));
const bRes = await fetch(`${API}/api/storage/buckets`, { headers: H });
const buckets = await bRes.json();
const bucketNames = Array.isArray(buckets) ? buckets.map(b => b.name || b) : [];
console.log(inf(`Buckets נמצאים: ${bucketNames.join(', ') || '(ריק)'}`));

// 4 – Create diana-images bucket if missing
if (bucketNames.includes('diana-images')) {
    console.log(ok('diana-images bucket כבר קיים'));
} else {
    console.log(inf('יוצר diana-images bucket...'));
    const r = await fetch(`${API}/api/storage/buckets`, {
        method: 'POST', headers: H,
        body: JSON.stringify({
            name: 'diana-images',
            public: true,
            allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
            maxFileSize: 10485760
        })
    });
    const d = await r.json();
    if (r.ok || r.status < 400) {
        console.log(ok(`diana-images bucket נוצר! (${r.status})`));
    } else {
        console.log(err(`יצירת bucket נכשלה: ${r.status} – ${JSON.stringify(d)}`));
    }
}

// 5 – Final verification
console.log('\n' + inf('אימות סופי...'));
const [t2, b2] = await Promise.all([
    fetch(`${API}/api/database/tables`, { headers: H }).then(r => r.json()),
    fetch(`${API}/api/storage/buckets`, { headers: H }).then(r => r.json()),
]);
const hasImages = Array.isArray(t2) ? t2.some(t => (t.name || t) === 'images') : JSON.stringify(t2).includes('images');
const hasBucket = Array.isArray(b2) ? b2.some(b => (b.name || b) === 'diana-images') : JSON.stringify(b2).includes('diana-images');

console.log('\n\x1b[1m── תוצאות סיכום ──\x1b[0m');
console.log(hasImages ? ok('טבלת images: קיימת ✓') : err('טבלת images: חסרה ✗'));
console.log(hasBucket ? ok('diana-images bucket: קיים ✓') : err('diana-images bucket: חסר ✗'));

if (hasImages && hasBucket) {
    console.log('\n\x1b[32m\x1b[1m🎉 InsForge מוכן! האתר יעבוד מלא.\x1b[0m\n');
} else {
    console.log('\n\x1b[33m⚠️  חלק מהרכיבים לא נוצרו – בדוק את הפלט למעלה\x1b[0m\n');
}
