/**
 * Generate a secure API key for REVMIS webhook integration
 * Run with: node generate-api-key.js
 */

const crypto = require('crypto');

// Generate a secure random API key (32 bytes = 64 hex characters)
const apiKey = crypto.randomBytes(32).toString('hex');

console.log('\n🔐 REVMIS Webhook API Key Generated!\n');
console.log('═══════════════════════════════════════════════════════════════════\n');
console.log('API Key:', apiKey);
console.log('\n═══════════════════════════════════════════════════════════════════\n');
console.log('📋 Instructions:\n');
console.log('1. Copy this API key');
console.log('2. Add it to your backend/.env file:');
console.log('   WEBHOOK_API_KEY=' + apiKey);
console.log('\n3. Share this API key with the REVMIS team (keep it secure!)');
console.log('4. They must include it in the X-API-Key header of their requests\n');
console.log('⚠️  IMPORTANT: Keep this API key secret and secure!\n');
