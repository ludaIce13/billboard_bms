import React, { useEffect, useState } from 'react'
import client from '../../api/client'

export default function AdminOperators() {
  const [ops, setOps] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await client.get('/operators')
      setOps(res.data || [])
    } catch (e) {
      setMsg('Failed to load operators')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const act = async (id, action) => {
    setMsg('')
    try {
      await client.post(`/operators/${id}/${action}`)
      load()
    } catch (e) {
      setMsg(`Failed to ${action}`)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-gray-900">Operators</h2>
      {msg && <div className="mb-3 text-sm text-red-600">{msg}</div>}
      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-sm text-gray-600">Loading operators...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50 text-sm text-gray-600">
            Registered billboard operators ({ops.length}).
          </div>
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-600">
                  <th className="p-2">ID</th>
                  <th className="p-2">Business</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Phone</th>
                  <th className="p-2">Category</th>
                  <th className="p-2">WARDC Business License</th>
                  <th className="p-2">Status</th>
                  <th className="p-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ops.map(o => (
                  <tr key={o.id} className="border-t">
                    <td className="p-2 align-top text-gray-800">{o.id}</td>
                    <td className="p-2 align-top font-medium text-gray-900">{o.business_name}</td>
                    <td className="p-2 align-top text-gray-700">{o.email}</td>
                    <td className="p-2 align-top text-gray-700">{o.phone}</td>
                    <td className="p-2 align-top text-gray-700">{o.category}</td>
                    <td className="p-2 align-top text-gray-700">{o.business_license_status === 'PAID' ? 'Yes' : 'No'}</td>
                    <td className="p-2 align-top text-gray-700">{o.status}</td>
                    <td className="p-2 align-top text-right">
                      {o.status === 'PENDING' ? (
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => act(o.id, 'approve')}
                            className="px-3 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-md"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => act(o.id, 'reject')}
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
