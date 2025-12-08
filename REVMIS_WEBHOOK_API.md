# REVMIS Payment Webhook API Documentation

## Overview
This endpoint allows REVMIS to automatically notify the Billboard Management System when a payment has been received. Upon successful payment confirmation, the system will automatically issue the corresponding billboard license.

---

## Endpoint Details

### **POST** `/api/webhook/revmis/payment`

**Description:** REVMIS calls this endpoint when payment for an invoice is received.

**Authentication:** None required (public endpoint for REVMIS integration)

**Content-Type:** `application/json`

---

## Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `invoice_no` | string | **Yes** | The invoice number (e.g., "INV-2025-357790") |
| `payment_reference` | string | **Yes** | REVMIS payment reference/transaction ID |
| `amount_paid` | number | **Yes** | Amount paid (must match invoice total) |
| `payment_date` | string | No | ISO 8601 date format (defaults to current date if not provided) |
| `status` | string | No | Payment status (optional) |

### Example Request

```json
{
  "invoice_no": "INV-2025-357790",
  "payment_reference": "REVMIS-TXN-123456789",
  "amount_paid": 2300,
  "payment_date": "2025-12-05T16:30:00.000Z",
  "status": "completed"
}
```

---

## Response

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Payment confirmed and license issued successfully",
  "license_no": "LIC-2025-001234",
  "invoice_no": "INV-2025-357790",
  "payment_reference": "REVMIS-TXN-123456789"
}
```

### License Already Issued (200 OK)

If a license has already been issued for this invoice:

```json
{
  "success": true,
  "message": "License already issued for this invoice",
  "license_no": "LIC-2025-001234",
  "invoice_no": "INV-2025-357790"
}
```

### Error Responses

#### 400 Bad Request - Missing Fields
```json
{
  "success": false,
  "message": "Missing required fields: invoice_no, payment_reference, amount_paid"
}
```

#### 404 Not Found - Invalid Invoice
```json
{
  "success": false,
  "message": "Invoice INV-2025-357790 not found"
}
```

#### 400 Bad Request - Payment Amount Mismatch
```json
{
  "success": false,
  "message": "Payment amount mismatch. Expected: 2300, Received: 2000"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error processing payment webhook"
}
```

---

## Integration Flow

1. **Billboard BMS** sends invoice to REVMIS
2. Customer pays invoice through REVMIS
3. **REVMIS** receives payment
4. **REVMIS** calls this webhook: `POST /api/webhook/revmis/payment`
5. **Billboard BMS** validates payment and automatically issues license
6. **Billboard BMS** returns license number to REVMIS

---

## Testing

### Test Endpoint (Development)
```
POST http://localhost:5000/api/webhook/revmis/payment
```

### Test Endpoint (Production)
```
POST https://your-production-domain.com/api/webhook/revmis/payment
```

### cURL Example

```bash
curl -X POST http://localhost:5000/api/webhook/revmis/payment \
  -H "Content-Type: application/json" \
  -d '{
    "invoice_no": "INV-2025-357790",
    "payment_reference": "REVMIS-TXN-123456789",
    "amount_paid": 2300,
    "payment_date": "2025-12-05T16:30:00.000Z"
  }'
```

---

## Security Notes

- This endpoint is publicly accessible (no authentication required)
- Payment amount is validated against invoice total
- Duplicate payments are handled gracefully (idempotent)
- All webhook calls are logged for audit purposes

---

## Support

For technical support or questions:
- **System:** Billboard Management System
- **Contact:** Billboard BMS Development Team
- **Last Updated:** December 5, 2025
