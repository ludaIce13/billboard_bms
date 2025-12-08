/**
 * Test script for REVMIS Payment Webhook
 * Run with: node test-webhook.js
 */

const http = require('http');

// Test data - Replace these values with actual invoice data from your system
const testPayload = {
  invoice_no: "INV-2025-357790", // Replace with actual invoice number
  payment_reference: "REVMIS-TEST-" + Date.now(),
  amount_paid: 2300, // Replace with actual invoice total
  payment_date: new Date().toISOString(),
  status: "completed"
};

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/webhook/revmis/payment',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'f22551190897ee63ecc9812858e0b7027262159c946ae0c5eba1bad64bf1822f' // Replace with your actual API key
  }
};

console.log('🚀 Testing REVMIS Payment Webhook...\n');
console.log('📤 Sending payload:');
console.log(JSON.stringify(testPayload, null, 2));
console.log('\n---\n');

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`✅ Response Status: ${res.statusCode}`);
    console.log('📥 Response Body:');
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
      
      if (parsed.success) {
        console.log('\n✨ SUCCESS! License issued:', parsed.license_no);
      } else {
        console.log('\n❌ ERROR:', parsed.message);
      }
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
  console.log('\n💡 Make sure the backend server is running on http://localhost:5000');
});

req.write(JSON.stringify(testPayload));
req.end();
