import React, { useEffect, useState } from 'react'
import client from '../../api/client'
import useToast from '../../hooks/useToast'
import useAuth from '../../hooks/useAuth'

export default function AdminInvoices() {
  const [tab, setTab] = useState('pending') // 'pending' or 'generated'
  const [approvedRequests, setApprovedRequests] = useState([])
  const [invoices, setInvoices] = useState([])
  const [tariffs, setTariffs] = useState([])
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const { toasts, showToast, removeToast } = useToast()
  const { user } = useAuth()
  const role = user?.role
  const isBilling = role === 'BILLING'

  const loadData = async () => {
    setLoading(true)
    try {
      // Load license requests + invoices + tariffs
      const [reqRes, invRes, tariffRes] = await Promise.all([
        client.get('/license-requests'),
        client.get('/invoices'),
        client.get('/tariffs'),
      ])

      const allRequests = reqRes.data || []
      const allInvoices = invRes.data || []
      const allTariffs = tariffRes.data || []

      // Build a set of request_ids that already have invoices
      const invoicedRequestIds = new Set(
        allInvoices
          .map(inv => inv.request_id)
          .filter(id => id != null)
      )

      // A request is considered "pending invoice" if:
      // - it has at least one APPROVED item
      // - and it does NOT yet have an invoice
      const approved = allRequests.filter(r => {
        const items = r.license_request_items || r.licenseRequestItems || []
        const hasApprovedItem = items.some(it => it.status === 'APPROVED')
        const hasInvoice = invoicedRequestIds.has(r.id)
        return hasApprovedItem && !hasInvoice
      })

      setApprovedRequests(approved)
      setInvoices(allInvoices)
      setTariffs(allTariffs)
    } catch (e) {
      showToast('Failed to load data', 'error')
    }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const generateInvoice = async (requestId) => {
    if (!isBilling) {
      showToast('Only Billing users can generate invoices. Please log in as the Billing user.', 'error')
      return
    }
    try {
      await client.post('/invoices', { request_id: requestId })
      showToast('Invoice generated successfully!', 'success')
      loadData()
    } catch (e) {
      const message = e.response?.data?.message || 'Failed to generate invoice'
      showToast(message, 'error')
    }
  }

  const sendToRevmis = async (invoiceId) => {
    try {
      const res = await client.post(`/invoices/${invoiceId}/revmis`)
      showToast('Invoice sent to REVMIS successfully!', 'success')
      loadData()
    } catch (e) {
      showToast('Failed to send to REVMIS', 'error')
    }
  }

  const deleteInvoice = async (invoiceId) => {
    if (!isBilling) {
      showToast('Only Billing users can delete invoices.', 'error')
      return
    }
    if (!window.confirm('Are you sure you want to delete this invoice?')) return
    try {
      await client.delete(`/invoices/${invoiceId}`)
      showToast('Invoice deleted successfully', 'success')
      loadData()
    } catch (e) {
      showToast('Failed to delete invoice', 'error')
    }
  }

  const viewInvoice = (invoice) => {
    setSelectedInvoice(invoice)
  }

  const getItemAmount = (item) => {
    if (!item) return null
    const match = tariffs.find(t =>
      String(t.ward_id) === String(item.ward_id) &&
      t.location_type === item.location_type &&
      t.surface_area_bucket === item.surface_area_bucket
    )
    return match ? match.tariff_amount : null
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="text-gray-600">Loading...</div>
    </div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Invoice Management</h2>
      </div>

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div key={toast.id} className={`p-4 rounded-lg shadow-lg ${
            toast.type === 'success' ? 'bg-green-50 border-l-4 border-green-500 text-green-800' :
            toast.type === 'error' ? 'bg-red-50 border-l-4 border-red-500 text-red-800' :
            'bg-blue-50 border-l-4 border-blue-500 text-blue-800'
          }`}>
            <div className="flex items-center justify-between">
              <span>{toast.message}</span>
              <button onClick={() => removeToast(toast.id)} className="ml-4 text-gray-500 hover:text-gray-700">&times;</button>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setTab('pending')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              tab === 'pending'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pending Invoice Generation ({approvedRequests.length})
          </button>
          <button
            onClick={() => setTab('generated')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              tab === 'generated'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Generated Invoices ({invoices.length})
          </button>
        </div>
      </div>

      {/* Pending Invoice Generation Tab */}
      {tab === 'pending' && (
        <div>
          {approvedRequests.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Pending Requests</h3>
              <p className="mt-1 text-sm text-gray-500">All approved requests have invoices generated.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b bg-gray-50 text-sm text-gray-600">
                Pending invoice generation for {approvedRequests.length} approved requests.
              </div>
              <div className="p-3 overflow-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-gray-600">
                      <th className="p-2">Request ID</th>
                      <th className="p-2">Operator</th>
                      <th className="p-2">Phone</th>
                      <th className="p-2">Email</th>
                      <th className="p-2">Billboards</th>
                      <th className="p-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvedRequests.map(req => {
                      const items = req.license_request_items || req.licenseRequestItems || []
                      const locationCount = items.length
                      return (
                        <tr key={req.id} className="border-t">
                          <td className="p-2 align-top font-medium text-gray-800">#{req.id}</td>
                          <td className="p-2 align-top">{req.operator?.business_name || 'N/A'}</td>
                          <td className="p-2 align-top">{req.operator?.phone || 'N/A'}</td>
                          <td className="p-2 align-top">{req.operator?.email || 'N/A'}</td>
                          <td className="p-2 align-top">{locationCount} {locationCount === 1 ? 'location' : 'locations'}</td>
                          <td className="p-2 align-top text-right">
                            <button
                              onClick={() => generateInvoice(req.id)}
                              disabled={!isBilling}
                              className={`px-4 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all ${
                                isBilling
                                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-md'
                                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              Generate Invoice
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Generated Invoices Tab */}
      {tab === 'generated' && (
        <div>
          {invoices.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Invoices Generated</h3>
              <p className="mt-1 text-sm text-gray-500">Generate invoices from approved license requests.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b bg-gray-50 text-sm text-gray-600">
                Generated invoices ({invoices.length}).
              </div>
              <div className="p-3 overflow-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-gray-600">
                      <th className="p-2">Invoice No.</th>
                      <th className="p-2">Operator</th>
                      <th className="p-2">Generated</th>
                      <th className="p-2">Subtotal (Le)</th>
                      <th className="p-2">GST (Le)</th>
                      <th className="p-2">Total (Le)</th>
                      <th className="p-2">REVMIS Status</th>
                      <th className="p-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map(inv => (
                      <tr key={inv.id} className="border-t">
                        <td className="p-2 align-top font-medium text-gray-800">{inv.invoice_no}</td>
                        <td className="p-2 align-top">{inv.operator?.business_name || 'N/A'}</td>
                        <td className="p-2 align-top text-xs text-gray-600">{new Date(inv.createdAt).toLocaleDateString()}</td>
                        <td className="p-2 align-top">{inv.subtotal?.toLocaleString() || 0}</td>
                        <td className="p-2 align-top">{inv.gst?.toLocaleString() || 0}</td>
                        <td className="p-2 align-top font-semibold text-blue-600">{inv.total?.toLocaleString() || 0}</td>
                        <td className="p-2 align-top">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            inv.revmis_status === 'sent' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          }`}>
                            {inv.revmis_status === 'sent' ? 'Sent to REVMIS' : 'Pending REVMIS'}
                          </span>
                        </td>
                        <td className="p-2 align-top text-right">
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => viewInvoice(inv)}
                              className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                            >
                              View Details
                            </button>
                            {isBilling && (
                              <>
                                {inv.revmis_status !== 'sent' && (
                                  <button
                                    onClick={() => sendToRevmis(inv.id)}
                                    className="px-3 py-1 text-xs bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg font-medium hover:from-orange-700 hover:to-orange-800 transition-all"
                                  >
                                    Send to REVMIS
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteInvoice(inv.id)}
                                  className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 border border-red-200 transition-colors"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedInvoice(null)}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto p-8" onClick={(e) => e.stopPropagation()}>
            {/* Invoice Template Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Billboard License Invoice</h2>
              <div className="text-sm text-gray-500">Invoice No: {selectedInvoice.invoice_no}</div>
            </div>

            {/* Operator Information */}
            <div className="mb-6 border border-gray-300 rounded-lg overflow-hidden">
              <table className="w-full">
                <tbody>
                  <tr className="border-b border-gray-300">
                    <td className="px-4 py-3 bg-gray-50 font-semibold w-1/3">Operator ID</td>
                    <td className="px-4 py-3">{selectedInvoice.operator_id}</td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="px-4 py-3 bg-gray-50 font-semibold">Operator Name</td>
                    <td className="px-4 py-3">{selectedInvoice.operator?.business_name || 'N/A'}</td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="px-4 py-3 bg-gray-50 font-semibold">Address</td>
                    <td className="px-4 py-3">{selectedInvoice.operator?.address || 'N/A'}</td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="px-4 py-3 bg-gray-50 font-semibold">Phone No.</td>
                    <td className="px-4 py-3">{selectedInvoice.operator?.phone || 'N/A'}</td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="px-4 py-3 bg-gray-50 font-semibold">e-Mail</td>
                    <td className="px-4 py-3">{selectedInvoice.operator?.email || 'N/A'}</td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="px-4 py-3 bg-gray-50 font-semibold">Request Date</td>
                    <td className="px-4 py-3">{selectedInvoice.license_request?.createdAt ? new Date(selectedInvoice.license_request.createdAt).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 bg-gray-50 font-semibold">Invoice Date</td>
                    <td className="px-4 py-3">{new Date(selectedInvoice.createdAt).toLocaleDateString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Billboard Details Table */}
            <div className="mb-6 border border-gray-300 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-300">
                    <th className="px-4 py-3 text-left font-semibold">License No.</th>
                    <th className="px-4 py-3 text-left font-semibold">Ward ID</th>
                    <th className="px-4 py-3 text-left font-semibold">Location Type</th>
                    <th className="px-4 py-3 text-left font-semibold">Plus Code</th>
                    <th className="px-4 py-3 text-left font-semibold">Surface Area</th>
                    <th className="px-4 py-3 text-right font-semibold">Amount (Le)</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedInvoice.license_request?.license_request_items || selectedInvoice.license_request?.licenseRequestItems || []).map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-300">
                      <td className="px-4 py-3">{item.license?.license_no || '-'}</td>
                      <td className="px-4 py-3">{item.ward_id}</td>
                      <td className="px-4 py-3">{item.location_type}</td>
                      <td className="px-4 py-3">{item.plus_code || '-'}</td>
                      <td className="px-4 py-3">{item.surface_area_bucket || item.surface_area}</td>
                      <td className="px-4 py-3 text-right">
                        {(() => {
                          const amt = getItemAmount(item)
                          return amt != null
                            ? amt.toLocaleString()
                            : '-'
                        })()}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-b border-gray-300 bg-gray-50">
                    <td colSpan="5" className="px-4 py-3 font-semibold text-right">Sub-Total</td>
                    <td className="px-4 py-3 text-right font-semibold">{selectedInvoice.subtotal?.toLocaleString() || 0}</td>
                  </tr>
                  <tr className="border-b border-gray-300 bg-gray-50">
                    <td colSpan="5" className="px-4 py-3 font-semibold text-right">GST</td>
                    <td className="px-4 py-3 text-right font-semibold">{selectedInvoice.gst?.toLocaleString() || 0}</td>
                  </tr>
                  <tr className="bg-blue-50">
                    <td colSpan="5" className="px-4 py-3 text-right font-bold text-lg">Total</td>
                    <td className="px-4 py-3 text-right font-bold text-blue-600 text-lg">{selectedInvoice.total?.toLocaleString() || 0}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
              {isBilling && selectedInvoice.revmis_status !== 'sent' && (
                <button
                  onClick={() => { sendToRevmis(selectedInvoice.id); setSelectedInvoice(null); }}
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg font-semibold hover:from-orange-700 hover:to-orange-800 transition-all"
                >
                  Send to REVMIS
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
