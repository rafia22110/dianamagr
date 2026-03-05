const API_URL = 'https://jxc5fi6w.us-east.insforge.app';
const API_KEY = process.env.INSFORGE_API_KEY || 'ik_3fc7e3357b072c0eb4937b87fe5c63c5';

async function createBucket() {
  const res = await fetch(`${API_URL}/api/storage/buckets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify({ bucketName: 'diana-images', isPublic: true }),
  });
  const data = await res.json();
  if (res.ok) {
    console.log('✓ Bucket diana-images created');
  } else {
    console.log('Bucket:', data.message || data.error || JSON.stringify(data));
  }
}

async function createTable(tableName, columns) {
  const res = await fetch(`${API_URL}/api/database/tables`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify({
      tableName,
      columns,
      rlsEnabled: true,
    }),
  });
  const data = await res.json();
  if (res.ok) {
    console.log(`✓ Table ${tableName} created`);
  } else {
    console.log(`Table ${tableName}:`, data.message || data.error || JSON.stringify(data));
  }
}

const TABLES = [
  {
    name: 'images',
    columns: [
      { name: 'id', type: 'uuid', nullable: false },
      { name: 'filename', type: 'string', nullable: false },
      { name: 'original_name', type: 'string', nullable: false },
      { name: 'category', type: 'string', nullable: false },
      { name: 'tags', type: 'json', nullable: true },
      { name: 'alt_text', type: 'string', nullable: true },
      { name: 'storage_path', type: 'string', nullable: true },
      { name: 'url', type: 'string', nullable: true },
      { name: 'upload_date', type: 'datetime', nullable: true },
    ]
  },
  {
    name: 'subscriptions',
    columns: [
      { name: 'id', type: 'uuid', nullable: false },
      { name: 'email', type: 'string', nullable: false },
      { name: 'created_at', type: 'datetime', nullable: true },
    ]
  },
  {
    name: 'workshops',
    columns: [
      { name: 'id', type: 'uuid', nullable: false },
      { name: 'title', type: 'string', nullable: false },
      { name: 'description', type: 'string', nullable: false },
      { name: 'date', type: 'datetime', nullable: false },
      { name: 'location', type: 'string', nullable: false },
      { name: 'price', type: 'number', nullable: false },
      { name: 'type', type: 'string', nullable: false },
    ]
  },
  {
    name: 'registrations',
    columns: [
      { name: 'id', type: 'uuid', nullable: false },
      { name: 'workshop_id', type: 'uuid', nullable: false },
      { name: 'name', type: 'string', nullable: false },
      { name: 'email', type: 'string', nullable: false },
      { name: 'phone', type: 'string', nullable: false },
      { name: 'created_at', type: 'datetime', nullable: true },
    ]
  },
  {
    name: 'orders',
    columns: [
      { name: 'id', type: 'uuid', nullable: false },
      { name: 'customer_name', type: 'string', nullable: false },
      { name: 'customer_email', type: 'string', nullable: false },
      { name: 'item_name', type: 'string', nullable: false },
      { name: 'amount', type: 'number', nullable: false },
      { name: 'status', type: 'string', nullable: false },
      { name: 'created_at', type: 'datetime', nullable: true },
    ]
  }
];

async function setup() {
  await createBucket();
  for (const table of TABLES) {
    await createTable(table.name, table.columns);
  }
}

setup().catch(console.error);
