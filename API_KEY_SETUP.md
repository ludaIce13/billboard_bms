# 🔐 API Key Setup Guide

## For Billboard BMS Team

### Step 1: Add API Key to Environment

Add this line to your `backend/.env` file:

```
WEBHOOK_API_KEY=f22551190897ee63ecc9812858e0b7027262159c946ae0c5eba1bad64bf1822f
```

### Step 2: Restart Backend Server

```bash
cd backend
npm run dev
```

The webhook endpoint is now protected with API key authentication.

---

## For REVMIS Team

### Your API Key

```
f22551190897ee63ecc9812858e0b7027262159c946ae0c5eba1bad64bf1822f
```

**⚠️ IMPORTANT:** Keep this key secure and confidential!

### How to Use

Include this API key in the `X-API-Key` header of all webhook requests:

```bash
curl -X POST https://your-billboard-system.com/api/webhook/revmis/payment \
  -H "Content-Type: application/json" \
  -H "X-API-Key: f22551190897ee63ecc9812858e0b7027262159c946ae0c5eba1bad64bf1822f" \
  -d '{ ... }'
```

---

## Generating a New API Key

If you need to rotate or generate a new API key:

```bash
cd backend
node generate-api-key.js
```

Then update:
1. Your `.env` file with the new key
2. Share the new key with REVMIS team
3. Update their integration to use the new key

---

## Security Best Practices

- ✅ Store API key in environment variables, never in code
- ✅ Use HTTPS in production
- ✅ Rotate API key periodically (every 6-12 months)
- ✅ Generate new API key if compromised
- ❌ Never commit API key to version control
- ❌ Never share API key in public channels
