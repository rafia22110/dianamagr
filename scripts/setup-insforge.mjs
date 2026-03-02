const API_URL = 'https://ane7v4ce.us-east.insforge.app';
const API_KEY = process.env.INSFORGE_API_KEY;

if (!API_KEY) {
  console.error('Error: INSFORGE_API_KEY environment variable is not set.');
  process.exit(1);
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
      columns: columns.map(col => ({
        columnName: col.name,
        type: col.type,
        isNullable: col.isNullable ?? true,
        isUnique: col.isUnique ?? false,
      })),
      rlsEnabled: true,
    }),
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    data = { error: text };
  }
  if (res.ok) {
    console.log(`✓ Table ${tableName} created`);
  } else {
    console.log(`Table ${tableName}:`, data.message || data.error || JSON.stringify(data));
  }
}

const schemas = [
  {
    name: 'workshops',
    columns: [
      { name: 'id', type: 'uuid', isNullable: false, isUnique: true },
      { name: 'title', type: 'string', isNullable: false },
      { name: 'description', type: 'string', isNullable: true },
      { name: 'date', type: 'datetime', isNullable: true },
      { name: 'price', type: 'float', isNullable: false },
      { name: 'is_online', type: 'boolean', isNullable: false },
      { name: 'image_url', type: 'string', isNullable: true },
      { name: 'status', type: 'string', isNullable: false },
    ]
  },
  {
    name: 'lectures',
    columns: [
      { name: 'id', type: 'uuid', isNullable: false, isUnique: true },
      { name: 'title', type: 'string', isNullable: false },
      { name: 'description', type: 'string', isNullable: true },
      { name: 'price', type: 'float', isNullable: true },
    ]
  },
  {
    name: 'registrations',
    columns: [
      { name: 'id', type: 'uuid', isNullable: false, isUnique: true },
      { name: 'workshop_id', type: 'uuid', isNullable: true },
      { name: 'lecture_id', type: 'uuid', isNullable: true },
      { name: 'full_name', type: 'string', isNullable: false },
      { name: 'email', type: 'string', isNullable: false },
      { name: 'phone', type: 'string', isNullable: false },
      { name: 'message', type: 'string', isNullable: true },
      { name: 'created_at', type: 'datetime', isNullable: true },
    ]
  },
  {
    name: 'subscribers',
    columns: [
      { name: 'id', type: 'uuid', isNullable: false, isUnique: true },
      { name: 'email', type: 'string', isNullable: false },
      { name: 'created_at', type: 'datetime', isNullable: true },
    ]
  },
  {
    name: 'orders',
    columns: [
      { name: 'id', type: 'uuid', isNullable: false, isUnique: true },
      { name: 'item_type', type: 'string', isNullable: false },
      { name: 'item_id', type: 'uuid', isNullable: true },
      { name: 'full_name', type: 'string', isNullable: false },
      { name: 'email', type: 'string', isNullable: false },
      { name: 'amount', type: 'float', isNullable: false },
      { name: 'status', type: 'string', isNullable: false },
      { name: 'payment_id', type: 'string', isNullable: true },
      { name: 'created_at', type: 'datetime', isNullable: true },
    ]
  }
];

async function setup() {
  for (const schema of schemas) {
    await createTable(schema.name, schema.columns);
  }
}

setup().catch(console.error);
