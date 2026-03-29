const https = require('https');

const data = JSON.stringify({
  name: "דו ג'ו",
  email: "joe.doe@example.com",
  phone: "0501234567",
  subscribed_at: new Date().toISOString()
});

const options = {
  hostname: 'ane7v4ce.us-east.insforge.app',
  port: 443,
  path: '/rest/v1/subscribers',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': 'ik_bf44df2031c6d8808e0d4cff27b52575',
    'Authorization': 'Bearer ik_bf44df2031c6d8808e0d4cff27b52575',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  console.log(`statusCode: ${res.statusCode}`);

  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.write(data);
req.end();
