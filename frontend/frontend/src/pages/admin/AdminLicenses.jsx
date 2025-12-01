import React, { useEffect, useState } from 'react'
import client from '../../api/client'

export default function AdminLicenses() {
  const [licenses, setLicenses] = useState([])
  const [councils, setCouncils] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [operatorFilter, setOperatorFilter] = useState('')
  const [licenseFilter, setLicenseFilter] = useState('')
  const [selectedLicense, setSelectedLicense] = useState(null)

  const load = async () => {
    setLoading(true)
    try { 
      const [licRes, councilRes] = await Promise.all([
        client.get('/licenses'),
        client.get('/councils')
      ])
      setLicenses(licRes.data || [])
      setCouncils(councilRes.data || [])
    } catch { setMsg('Failed to load licenses') }
    setLoading(false)
  }
  useEffect(()=>{ load() }, [])

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Licenses</h2>
      {msg && <div className="mb-3 text-sm text-red-600">{msg}</div>}

      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Operator Name</label>
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Search operator"
            value={operatorFilter}
            onChange={(e)=>setOperatorFilter(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">License No</label>
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Search license no"
            value={licenseFilter}
            onChange={(e)=>setLicenseFilter(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <button onClick={()=>{setOperatorFilter('');setLicenseFilter('')}} className="w-full border rounded px-3 py-2 hover:bg-gray-50">Clear</button>
        </div>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-3">License No</th>
                <th className="text-left p-3">Issue Date</th>
                <th className="text-left p-3">Operator Name</th>
                <th className="text-left p-3">Council</th>
                <th className="text-left p-3">Plus Code</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...licenses]
                .sort((a,b)=> new Date(b.issue_date) - new Date(a.issue_date))
                .filter(l => {
                  const opName = l.invoice?.operator?.business_name || ''
                  const matchOp = operatorFilter ? opName.toLowerCase().includes(operatorFilter.toLowerCase()) : true
                  const matchLic = licenseFilter ? String(l.license_no).toLowerCase().includes(licenseFilter.toLowerCase()) : true
                  return matchOp && matchLic
                })
                .map(l => {
                  const items = l.invoice?.license_request?.license_request_items || []
                  const firstItem = items[0]
                  const councilId = l.invoice?.license_request?.council_id
                  const council = councils.find(c => c.id === councilId)
                  return (
                  <tr key={l.id} className="border-t">
                    <td className="p-3 font-medium">{l.license_no}</td>
                    <td className="p-3">{l.issue_date}</td>
                    <td className="p-3">{l.invoice?.operator?.business_name || '-'}</td>
                    <td className="p-3">{council?.name || councilId || '-'}</td>
                    <td className="p-3">{firstItem ? firstItem.plus_code : '-'}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button onClick={()=>setSelectedLicense(l)} className="text-xs px-2 py-1 border rounded hover:bg-blue-50 text-blue-600">View Details</button>
                        <button className="text-xs px-2 py-1 border rounded hover:bg-green-50 text-green-600">Send QR</button>
                      </div>
                    </td>
                  </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      )}

      {selectedLicense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={()=>setSelectedLicense(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto" onClick={e=>e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">License Details</h3>
                <button onClick={()=>setSelectedLicense(null)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
              </div>
              
              <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium">License No:</span> {selectedLicense.license_no}</div>
                <div><span className="font-medium">Issue Date:</span> {selectedLicense.issue_date}</div>
                <div><span className="font-medium">Operator:</span> {selectedLicense.invoice?.operator?.business_name}</div>
                <div><span className="font-medium">Invoice No:</span> {selectedLicense.invoice?.invoice_no}</div>
              </div>

              <h4 className="font-medium mb-2 text-gray-700">Billboard Locations:</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-2 border">Council</th>
                      <th className="text-left p-2 border">Location Type</th>
                      <th className="text-left p-2 border">Street Name</th>
                      <th className="text-left p-2 border">Plus Code</th>
                      <th className="text-left p-2 border">Surface Area</th>
                      <th className="text-left p-2 border">GPS Coordinates</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedLicense.invoice?.license_request?.license_request_items || []).map((item, idx) => {
                      const councilId = selectedLicense.invoice?.license_request?.council_id
                      const council = councils.find(c => c.id === councilId)
                      return (
                        <tr key={idx} className="border-t">
                          <td className="p-2 border">{council?.name || councilId || '-'}</td>
                          <td className="p-2 border">{item.location_type}</td>
                          <td className="p-2 border">{item.street_name || '-'}</td>
                          <td className="p-2 border font-mono text-xs">{item.plus_code}</td>
                          <td className="p-2 border">{item.surface_area_bucket}</td>
                          <td className="p-2 border text-xs">{item.gps_lat}, {item.gps_long}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex gap-2 justify-end">
                {selectedLicense.pdf_url && (
                  <a href={selectedLicense.pdf_url} target="_blank" rel="noreferrer" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">View PDF</a>
                )}
                <button className="px-4 py-2 border rounded hover:bg-gray-50">Send QR via Email</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
