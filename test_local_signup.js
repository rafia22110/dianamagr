const http = require('http');

const data = JSON.stringify({
  name: "דו ג'ו",
  email: "joe_doe_local@example.com",
  phone: "0501234567"
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/insforge/rest/v1/subscribers', // This goes through our proxy!
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('Testing Newsletter signup through the LOCAL PROXY...');

const req = http.request(options, (res) => {
  console.log(`Response StatusCode: ${res.statusCode}`);
  let body = '';
  res.on('data', (d) => { body += d; });
  res.on('end', () => {
    console.log('Response Body:', body);
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('✅ SIGNUP SUCCESSFUL! The proxy is working correctly.');
    } else {
      console.log('❌ SIGNUP FAILED. Check server logs.');
    }
  });
});

req.on('error', (error) => {
  console.error('Connection Error:', error.message);
});

req.write(data);
req.end();
