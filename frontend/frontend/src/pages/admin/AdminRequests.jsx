import React, { useEffect, useState } from 'react'
import client from '../../api/client'

export default function AdminRequests() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await client.get('/license-requests')
      setList(res.data || [])
      setMsg('')
    } catch (e) {
      const serverMsg = e?.response?.data?.message || 'Failed to load requests'
      setMsg(serverMsg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const approveItem = async (itemId, status) => {
    setMsg('')
    try {
      await client.post(`/license-requests/${itemId}/approve`, { status })
      await load()
    } catch (e) {
      const serverMsg = e?.response?.data?.message || 'Failed to update item'
      setMsg(serverMsg)
    }
  }

  const renderStatusBadge = (status) => {
    const base = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold'
    if (status === 'APPROVED') return <span className={`${base} bg-emerald-50 text-emerald-700 border border-emerald-200`}>APPROVED</span>
    if (status === 'REJECTED') return <span className={`${base} bg-red-50 text-red-700 border border-red-200`}>REJECTED</span>
    return <span className={`${base} bg-amber-50 text-amber-700 border border-amber-200`}>PENDING</span>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">License Requests</h2>
          <p className="text-sm text-gray-600">Review and approve billboard license locations submitted by operators.</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-60"
        >
          Refresh
        </button>
      </div>

      {msg && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-700">
          {msg}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-sm text-gray-600">Loading license requests...</div>
      ) : list.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-sm text-gray-600">
          There are currently no license requests to review.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing all license request items across {list.length} requests.
            </div>
          </div>
          <div className="p-3 overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-600">
                  <th className="p-2">Request ID</th>
                  <th className="p-2">Operator ID</th>
                  <th className="p-2">Item ID</th>
                  <th className="p-2">Ward</th>
                  <th className="p-2">Location</th>
                  <th className="p-2">Surface</th>
                  <th className="p-2">Plus Code</th>
                  <th className="p-2">GPS</th>
                  <th className="p-2">Status</th>
                  <th className="p-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.flatMap(req => {
                  const items = req.license_request_items || req.licenseRequestItems || []
                  return items.map(item => (
                    <tr key={item.id} className="border-t">
                      <td className="p-2 align-top text-gray-700">#{req.id}</td>
                      <td className="p-2 align-top text-gray-700">{req.operator_id}</td>
                      <td className="p-2 align-top">{item.id}</td>
                      <td className="p-2 align-top">{item.ward_id}</td>
                      <td className="p-2 align-top">{item.location_type}</td>
                      <td className="p-2 align-top">{item.surface_area_bucket}</td>
                      <td className="p-2 align-top font-mono text-xs">{item.plus_code}</td>
                      <td className="p-2 align-top text-xs">{item.gps_lat}, {item.gps_long}</td>
                      <td className="p-2 align-top">{renderStatusBadge(item.status)}</td>
                      <td className="p-2 align-top text-right">
                        {item.status === 'PENDING' ? (
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => approveItem(item.id, 'APPROVED')}
                              className="px-3 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-md"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => approveItem(item.id, 'REJECTED')}
                              className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded-md"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">No actions</span>
                        )}
                      </td>
                    </tr>
                  ))
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
