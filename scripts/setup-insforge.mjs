const API_URL = 'https://jxc5fi6w.us-east.insforge.app';
const API_KEY = process.env.INSFORGE_API_KEY;

if (!API_KEY) {
  console.error('❌ Error: INSFORGE_API_KEY environment variable is missing.');
  console.info('Please set it using: export INSFORGE_API_KEY=your_key_here');
  process.exit(1);
}

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

async function createTable() {
  const res = await fetch(`${API_URL}/api/database/tables`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify({
      tableName: 'images',
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
      ],
      rlsEnabled: true,
    }),
  });
  const data = await res.json();
  if (res.ok) {
    console.log('✓ Table images created');
  } else {
    console.log('Table:', data.message || data.error || JSON.stringify(data));
  }
}

createBucket().then(createTable).catch(console.error);
