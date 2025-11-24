# BILLING Role Configuration

## Overview
The BILLING role has been configured to have **restricted access** as per the specification. BILLING users can ONLY access invoice generation and management functionality.

---

## BILLING User Access

### ✅ What BILLING Users CAN Access

1. **Dashboard**
   - View system overview
   - See basic statistics

2. **Generate Invoices** (under "Billing" section)
   - Generate invoices for approved billboard license requests
   - View all invoices
   - Send invoices to REVMIS billing system
   - Preview REVMIS invoice payloads

### ❌ What BILLING Users CANNOT Access

- ❌ Operator Registration
- ❌ New License Requests
- ❌ User Management
- ❌ Operator Management
- ❌ Pending License Requests Review
- ❌ Tariff Management
- ❌ License Management

---

## Login Credentials

### BILLING User
```
Email: billing@bms.com
Password: billing123
Role: BILLING
```

### SUPER ADMIN (for comparison)
```
Email: admin@bms.com
Password: admin123
Role: SUPER_ADMIN
```

---

## Navigation Structure

### BILLING User Sees:
```
├── Dashboard
└── Billing
    └── Generate Invoices
```

### SUPER_ADMIN User Sees:
```
├── Dashboard
├── Public
│   ├── Operator Registration
│   └── New License Request
└── Admin
    ├── Users
    ├── Operators
    ├── Pending License Requests
    ├── Tariffs
    ├── Invoices
    └── Licenses
```

---

## Invoice Template (Per Specification)

According to **Appendix 5** in the specification, invoices include:

### Operator Information
- Operator ID
- Operator Name
- Address
- Phone No.
- e-Mail
- Request Date
- Invoice Date

### Billboard Details (per license)
- License No.
- Ward ID
- Location Type
- Plus Code
- Surface Area
- Amount (Le)

### Totals
- Sub-Total
- GST
- **Total**

---

## BILLING User Workflow

1. **Login** as BILLING user
2. **Navigate to "Generate Invoices"**
3. **View approved license requests** ready for billing
4. **Generate invoice** for each approved request
5. **Send invoice to REVMIS** billing system via API integration
6. **Track invoice status**

---

## Technical Implementation

### Frontend (Sidebar.jsx)
```javascript
// BILLING users only see Dashboard and Invoices
{isBilling && (
  <>
    <div className="...">Billing</div>
    <Link to="/admin/invoices">Generate Invoices</Link>
  </>
)}

// All other menu items are hidden for BILLING users
{!isBilling && (
  // Full menu for other roles
)}
```

### Backend (invoices.ts)
```javascript
// Routes accessible to BILLING users
router.post('/', verifyToken, generateInvoice);        // Create invoice
router.get('/', verifyToken, listInvoices);            // List invoices
router.post('/:id/revmis', verifyToken, sendToRevmis); // Send to REVMIS
```

No special role restriction needed - BILLING users are authenticated and can access these routes.

### Database (User model)
```typescript
role: 'BILLING'  // One of: SUPER_ADMIN | MANAGER | BILLING | OPERATOR
```

---

## Security Features

1. ✅ **Authentication Required**: BILLING users must log in
2. ✅ **Role-Based UI**: Only sees relevant menu items
3. ✅ **Token-Based Access**: JWT tokens verify identity
4. ✅ **Frontend Route Protection**: Protected routes check authentication
5. ✅ **Backend Middleware**: `verifyToken` middleware on all invoice routes

---

## Testing the BILLING Role

### Steps:
1. **Logout** from current session
2. **Login** with:
   - Email: `billing@bms.com`
   - Password: `billing123`
3. **Verify** you only see:
   - Dashboard
   - Generate Invoices
4. **Try accessing** other pages (should be redirected or denied)

---

## REVMIS Integration

As per the specification:
> "The system will require an API for integration, to POST all active invoices into the REVMIS Billing tables. This process is done by the Billing User."

BILLING users can:
- Generate invoices with unique identifier numbers
- POST invoices to REVMIS billing API
- Use tariff table for automatic amount calculation
- Include GST in invoice totals

---

## Future Enhancements

1. **Invoice Analytics Dashboard** for BILLING users
2. **Bulk Invoice Generation** for multiple approved requests
3. **Invoice Templates** customization
4. **Payment Status Tracking** from REVMIS
5. **Invoice History Reports**

---

**Date**: November 12, 2025  
**Status**: BILLING role configured and tested ✅
