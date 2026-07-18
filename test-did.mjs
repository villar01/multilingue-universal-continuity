// Test D-ID API key - try both formats
import https from 'https';

function makeRequest(authHeader) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.d-id.com',
      path: '/credits',
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch(e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('timeout')); });
    req.end();
  });
}

// The user provided the key as: cm92aWxsYXIwMkBnbWFpbC5jb20:wayHj2tMM42ZwhDvHzplo
// D-ID expects: Basic base64(email:apikey)
// So we need to base64 encode the whole string
const raw = 'cm92aWxsYXIwMkBnbWFpbC5jb20:wayHj2tMM42ZwhDvHzplo';
const b64 = Buffer.from(raw).toString('base64');

console.log('=== Testing Format 1: Basic base64(raw) ===');
try {
  const r1 = await makeRequest(`Basic ${b64}`);
  console.log('Status:', r1.status);
  console.log('Response:', JSON.stringify(r1.body));
  if (r1.status === 200) console.log('✅ FORMAT 1 WORKS!');
} catch(e) { console.log('Error:', e.message); }

console.log('\n=== Testing Format 2: Basic raw (direct) ===');
try {
  const r2 = await makeRequest(`Basic ${raw}`);
  console.log('Status:', r2.status);
  console.log('Response:', JSON.stringify(r2.body));
  if (r2.status === 200) console.log('✅ FORMAT 2 WORKS!');
} catch(e) { console.log('Error:', e.message); }
