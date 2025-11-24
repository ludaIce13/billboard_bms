import React, { useState } from 'react'
import axios from 'axios'

export default function InvoiceTest() {
  const [response, setResponse] = useState(null)

  const sendTestInvoice = async () => {
    const testInvoice = {
      invoice_no: 'INV-2025-000123',
      operator: {
        id: 'OP-00034',
        name: 'Bright Ads Ltd.',
        email: 'contact@brightads.com'
      },
      financials: {
        subtotal: 75000,
        gst_percentage: 15,
        gst_amount: 11250,
        total_amount: 86250
      },
      payment: {
        status: 'PENDING'
      }
    }
    try {
      const res = await axios.post('http://localhost:5000/api/invoices/revmis', testInvoice)
      setResponse(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">REVMIS Integration Test</h2>
      <button
        onClick={sendTestInvoice}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        Send Invoice to REVMIS (Placeholder)
      </button>

      {response && (
        <pre className="mt-6 bg-gray-100 p-4 rounded text-sm">
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  )
}
