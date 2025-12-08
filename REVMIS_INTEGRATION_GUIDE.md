# REVMIS Integration Guide - Billboard License Automation

## 📋 Quick Summary

When REVMIS receives payment for a billboard invoice, call our webhook endpoint to automatically issue the license.

---

## 🔗 Webhook Endpoint

### **Production URL** (Update with your actual domain)
```
POST https://your-billboard-system.com/api/webhook/revmis/payment
```

### **Development/Testing URL**
```
POST http://localhost:5000/api/webhook/revmis/payment
```

### **🔐 API Key Required**

**Header:** `X-API-Key`  
**Value:** Your provided API key (keep this secure!)

All requests must include the API key in the request headers for authentication.

---

## 📤 What to Send

Send a JSON POST request with these fields:

| Field | Required | Type | Description | Example |
|-------|----------|------|-------------|---------|
| `invoice_no` | ✅ Yes | string | Invoice number from our system | "INV-2025-357790" |
| `payment_reference` | ✅ Yes | string | Your REVMIS transaction/reference ID | "REVMIS-TXN-123456789" |
| `amount_paid` | ✅ Yes | number | Amount paid by customer | 2300 |
| `payment_date` | ❌ No | string | ISO 8601 date (optional) | "2025-12-05T16:30:00Z" |

### ✅ Example Request (cURL)

```bash
curl -X POST https://your-billboard-system.com/api/webhook/revmis/payment \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key_here" \
  -d '{
    "invoice_no": "INV-2025-357790",
    "payment_reference": "REVMIS-TXN-123456789",
    "amount_paid": 2300,
    "payment_date": "2025-12-05T16:30:00Z"
  }'
```

### ✅ Example Request (JavaScript/Node.js)

```javascript
const axios = require('axios');

const payload = {
  invoice_no: "INV-2025-357790",
  payment_reference: "REVMIS-TXN-123456789",
  amount_paid: 2300,
  payment_date: new Date().toISOString()
};

const headers = {
  'Content-Type': 'application/json',
  'X-API-Key': 'your_api_key_here'
};

axios.post('https://your-billboard-system.com/api/webhook/revmis/payment', payload, { headers })
  .then(response => {
    console.log('License issued:', response.data.license_no);
  })
  .catch(error => {
    console.error('Error:', error.response.data);
  });
```

### ✅ Example Request (Python)

```python
import requests
from datetime import datetime

payload = {
    "invoice_no": "INV-2025-357790",
    "payment_reference": "REVMIS-TXN-123456789",
    "amount_paid": 2300,
    "payment_date": datetime.utcnow().isoformat() + "Z"
}

headers = {
    'Content-Type': 'application/json',
    'X-API-Key': 'your_api_key_here'
}

response = requests.post(
    'https://your-billboard-system.com/api/webhook/revmis/payment',
    json=payload,
    headers=headers
)

if response.json()['success']:
    print(f"License issued: {response.json()['license_no']}")
else:
    print(f"Error: {response.json()['message']}")
```

---

## 📥 What You'll Receive

### ✅ Success Response (200 OK)

```json
{
  "success": true,
  "message": "Payment confirmed and license issued successfully",
  "license_no": "LIC-2025-001234",
  "invoice_no": "INV-2025-357790",
  "payment_reference": "REVMIS-TXN-123456789"
}
```

**Important:** Save the `license_no` returned - this is the official license number!

### ⚠️ Already Processed (200 OK)

If you call the endpoint twice for the same invoice (idempotent):

```json
{
  "success": true,
  "message": "License already issued for this invoice",
  "license_no": "LIC-2025-001234",
  "invoice_no": "INV-2025-357790"
}
```

### ❌ Error Responses

#### Missing API Key (401)
```json
{
  "success": false,
  "message": "API key required. Please provide X-API-Key header"
}
```
**Action:** Include the X-API-Key header in your request

#### Invalid API Key (403)
```json
{
  "success": false,
  "message": "Invalid API key"
}
```
**Action:** Verify you're using the correct API key provided by Billboard BMS

#### Invoice Not Found (404)
```json
{
  "success": false,
  "message": "Invoice INV-2025-357790 not found"
}
```
**Action:** Verify the invoice number is correct

#### Amount Mismatch (400)
```json
{
  "success": false,
  "message": "Payment amount mismatch. Expected: 2300, Received: 2000"
}
```
**Action:** Payment amount must exactly match the invoice total

#### Missing Fields (400)
```json
{
  "success": false,
  "message": "Missing required fields: invoice_no, payment_reference, amount_paid"
}
```
**Action:** Include all required fields in your request

---

## 🔄 Integration Flow

```
1. Billboard BMS generates invoice → sends to REVMIS
                ↓
2. Customer pays invoice through REVMIS
                ↓
3. REVMIS receives payment confirmation
                ↓
4. REVMIS calls webhook: POST /api/webhook/revmis/payment
                ↓
5. Billboard BMS validates payment & issues license
                ↓
6. Billboard BMS returns license number
                ↓
7. REVMIS stores license number for customer
```

---

## 🔒 Security & Best Practices

- 🔐 **API Key Authentication Required** - All requests must include valid API key in X-API-Key header
- 🔒 **Keep API Key Secure** - Store the API key securely and never commit it to version control
- ✅ **Idempotent** - Safe to call multiple times (won't create duplicate licenses)
- ✅ **Amount Validation** - Payment amount is verified against invoice total
- ✅ **Logging** - All webhook calls are logged for audit purposes
- ✅ **HTTPS Required** - Use HTTPS in production for secure transmission
- ⚠️ **Rotate API Key** - Request a new API key if you suspect it has been compromised

---

## 🧪 Testing Checklist

Before going live, test these scenarios:

- [ ] Valid payment with API key - should return license number
- [ ] Request without API key - should return 401 error
- [ ] Request with invalid API key - should return 403 error
- [ ] Duplicate payment - should return same license number
- [ ] Invalid invoice number - should return 404 error
- [ ] Wrong amount - should return 400 error
- [ ] Missing fields - should return 400 error

---

## 📞 Support & Contact

**System:** Billboard Management System  
**Integration Type:** REVMIS Payment Webhook  
**Endpoint Status:** ✅ Active and Ready

For technical questions or issues:
- Contact: Billboard BMS Development Team
- Documentation Updated: December 5, 2025

---

## 🚀 Quick Start

1. **Test with a real invoice from the system**
2. **Call the webhook when payment is confirmed**
3. **Save the returned license number**
4. **Done!** License is automatically issued

---

*That's it! The integration is designed to be simple and reliable.*
