import React, { useEffect, useState } from 'react'
import client from '../../api/client'
import { formatNumber } from '../../utils/formatNumber'

export default function AdminRequests() {
  const [list, setList] = useState([])
  const [councils, setCouncils] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [reqRes, councilRes] = await Promise.all([
        client.get('/license-requests'),
        client.get('/councils')
      ])
      setList(reqRes.data || [])
      setCouncils(councilRes.data || [])
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

  // Calculate stats
  const totalRequests = list.length;
  const allItems = list.flatMap(r => r.license_request_items || r.licenseRequestItems || []);
  const pendingCount = allItems.filter(item => item.status === 'PENDING').length;
  const approvedCount = allItems.filter(item => item.status === 'APPROVED').length;
  const rejectedCount = allItems.filter(item => item.status === 'REJECTED').length;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">License Requests</h2>
        <p className="text-gray-600 text-sm">Review and approve billboard license locations submitted by operators.</p>
      </div>
      
      {msg && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{msg}</div>}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : list.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center text-gray-500">
          No license requests found.
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            {/* Total Requests Card - Blue */}
            <div className="bg-white rounded-lg p-6 shadow border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="text-gray-600 text-sm font-medium">Total Requests</div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">{formatNumber(totalRequests)}</div>
            </div>

            {/* Pending Card - Amber */}
            <div className="bg-white rounded-lg p-6 shadow border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="text-gray-600 text-sm font-medium">Pending Items</div>
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">{formatNumber(pendingCount)}</div>
            </div>

            {/* Approved Card - Green */}
            <div className="bg-white rounded-lg p-6 shadow border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="text-gray-600 text-sm font-medium">Approved Items</div>
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">{formatNumber(approvedCount)}</div>
            </div>

            {/* Rejected Card - Gray */}
            <div className="bg-white rounded-lg p-6 shadow border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="text-gray-600 text-sm font-medium">Rejected Items</div>
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">{formatNumber(rejectedCount)}</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-6 border-b border-gray-200">
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
                    <th className="p-2">Council</th>
                    <th className="p-2">Location</th>
                    <th className="p-2">Surface</th>
                    <th className="p-2">Street Name</th>
                    <th className="p-2">Plus Code</th>
                    <th className="p-2">GPS</th>
                    <th className="p-2">Status</th>
                    <th className="p-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {list.flatMap(req => {
                    const items = req.license_request_items || req.licenseRequestItems || []
                    const councilId = req.council_id
                    const council = councils.find(c => c.id === councilId)
                    return items.map(item => (
                      <tr key={item.id} className="border-t">
                        <td className="p-2 align-top text-gray-700">#{req.id}</td>
                        <td className="p-2 align-top text-gray-700">{req.operator_id}</td>
                        <td className="p-2 align-top">{council?.name || councilId || '-'}</td>
                        <td className="p-2 align-top">{item.location_type}</td>
                        <td className="p-2 align-top">{item.surface_area_bucket}</td>
                        <td className="p-2 align-top">{item.street_name || '-'}</td>
                        <td className="p-2 align-top font-mono text-xs">{item.plus_code}</td>
                        <td className="p-2 align-top text-xs">{item.gps_lat}, {item.gps_long}</td>
                        <td className="p-2 align-top">{renderStatusBadge(item.status)}</td>
                        <td className="p-2 align-top text-right">
                          {item.status === 'PENDING' ? (
                            <div className="inline-flex gap-2">
                              <button
                                onClick={() => approveItem(item.id, 'APPROVED')}
                                className="px-3 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => approveItem(item.id, 'REJECTED')}
                                className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded font-medium"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
