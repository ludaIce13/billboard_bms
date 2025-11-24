import React, { useEffect, useMemo, useState } from 'react'
import client from '../../api/client'
import useAuth from '../../hooks/useAuth'
import { WARDS, LOCATION_TYPES, SURFACE_AREA_BUCKETS } from '../../utils/constants'

export default function AdminTariffs() {
  const { user } = useAuth()
  const [file, setFile] = useState(null)
  const [msg, setMsg] = useState('')
  const [tariffs, setTariffs] = useState([])
  const [loading, setLoading] = useState(true)
  const [wardFilter, setWardFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [surfaceFilter, setSurfaceFilter] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})

  const canManage = user?.role === 'SUPER_ADMIN' || user?.role === 'MANAGER'

  const load = async () => {
    setLoading(true)
    try { const res = await client.get('/tariffs'); setTariffs(res.data || []) } catch {}
    setLoading(false)
  }
  useEffect(()=>{ load() }, [])

  const uploadCsv = async (e) => {
    e.preventDefault()
    setMsg('')
    if (!file) { setMsg('Please choose a CSV file'); return }
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await client.post('/tariffs/upload-csv', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      
      if (res.data.errors && res.data.errors.length > 0) {
        const errorMsg = `Imported ${res.data.count} rows. ${res.data.totalErrors} errors:\n${res.data.errors.join('\n')}`
        setMsg(errorMsg)
      } else {
        setMsg(`✅ Successfully imported ${res.data.count} rows`)
      }
      
      setFile(null)
      load()
    } catch (e) {
      const errData = e?.response?.data
      if (errData?.errors) {
        const errorMsg = `${errData.message}\n\nErrors:\n${errData.errors.join('\n')}`
        setMsg(errorMsg)
      } else {
        setMsg(errData?.message || 'Upload failed')
      }
    }
  }

  const startEdit = (tariff) => {
    setEditingId(tariff.id)
    setEditForm({ ...tariff })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const saveEdit = async () => {
    try {
      await client.put(`/tariffs/${editingId}`, editForm)
      setMsg('Tariff updated successfully')
      cancelEdit()
      load()
    } catch (e) {
      setMsg('Failed to update tariff')
    }
  }

  const deleteTariff = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tariff?')) return
    try {
      await client.delete(`/tariffs/${id}`)
      setMsg('Tariff deleted successfully')
      load()
    } catch (e) {
      setMsg('Failed to delete tariff')
    }
  }

  const filteredTariffs = useMemo(() => {
    return tariffs.filter(t => (
      (wardFilter ? String(t.ward_id) === String(wardFilter) : true) &&
      (locationFilter ? t.location_type === locationFilter : true) &&
      (surfaceFilter ? t.surface_area_bucket === surfaceFilter : true)
    ))
  }, [tariffs, wardFilter, locationFilter, surfaceFilter])

  const downloadTemplate = () => {
    const header = 'Ward No,Location,Surface Area,Tariff Amount\n'
    const samples = [
      '1,Peri-Urban Highways,<2m2,1000',
      '1,Peri-Urban Highways,2m2-5m2,2500',
      '1,Main Artery Road,5m2-10m2,5000',
      '2,Public Trunk Road,>10m2,10000',
      '3,Community Access Road,2m2-5m2,1500'
    ]
    const csv = header + samples.join('\n') + '\n'
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'tariff_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2">Tariff Table</h2>
      {canManage && (
        <p className="text-sm text-gray-600 mb-4">Columns must be: Ward No, Location, Surface Area, Tariff Amount. Location and Surface Area must match the predefined menus.</p>
      )}

      {canManage && (
        <>
          <div className="p-3 mb-4 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-800">Only Super Admin and Manager can upload tariffs.</div>

          <form onSubmit={uploadCsv} className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
            <input type="file" accept=".csv" onChange={e=>setFile(e.target.files?.[0]||null)} />
            <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">Upload CSV</button>
            <button type="button" onClick={downloadTemplate} className="px-3 py-2 border rounded hover:bg-gray-50">Download Sample CSV</button>
          </form>
        </>
      )}
      
      {msg && (
        <div className={`mb-4 p-4 rounded-lg border whitespace-pre-wrap ${
          msg.includes('✅') ? 'bg-green-50 border-green-300 text-green-800' : 'bg-red-50 border-red-300 text-red-800'
        }`}>
          {msg}
        </div>
      )}

      <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Ward</label>
          <select value={wardFilter} onChange={e=>setWardFilter(e.target.value)} className="w-full border rounded px-2 py-2">
            <option value="">All</option>
            {WARDS.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Location</label>
          <select value={locationFilter} onChange={e=>setLocationFilter(e.target.value)} className="w-full border rounded px-2 py-2">
            <option value="">All</option>
            {LOCATION_TYPES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Surface Area</label>
          <select value={surfaceFilter} onChange={e=>setSurfaceFilter(e.target.value)} className="w-full border rounded px-2 py-2">
            <option value="">All</option>
            {SURFACE_AREA_BUCKETS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {canManage && (
          <div className="flex items-end">
            <button onClick={()=>{setWardFilter('');setLocationFilter('');setSurfaceFilter('')}} className="w-full border rounded px-3 py-2 hover:bg-gray-50">Clear</button>
          </div>
        )}
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-3">Ward No</th>
                <th className="text-left p-3">Location</th>
                <th className="text-left p-3">Surface Area</th>
                <th className="text-left p-3">Tariff Amount (Le)</th>
                {canManage && <th className="text-left p-3">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredTariffs.map(t => (
                <tr key={t.id} className="border-t">
                  <td className="p-3">
                    {editingId === t.id ? (
                      <input type="number" value={editForm.ward_id} onChange={e=>setEditForm({...editForm, ward_id: Number(e.target.value)})} className="border rounded px-2 py-1 w-20" />
                    ) : t.ward_id}
                  </td>
                  <td className="p-3">
                    {editingId === t.id ? (
                      <select value={editForm.location_type} onChange={e=>setEditForm({...editForm, location_type: e.target.value})} className="border rounded px-2 py-1">
                        {LOCATION_TYPES.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    ) : t.location_type}
                  </td>
                  <td className="p-3">
                    {editingId === t.id ? (
                      <select value={editForm.surface_area_bucket} onChange={e=>setEditForm({...editForm, surface_area_bucket: e.target.value})} className="border rounded px-2 py-1">
                        {SURFACE_AREA_BUCKETS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    ) : t.surface_area_bucket}
                  </td>
                  <td className="p-3">
                    {editingId === t.id ? (
                      <input type="number" value={editForm.tariff_amount} onChange={e=>setEditForm({...editForm, tariff_amount: Number(e.target.value)})} className="border rounded px-2 py-1 w-24" />
                    ) : (
                      <span>{t.tariff_amount}</span>
                    )}
                  </td>
                  {canManage && (
                    <td className="p-3">
                      {editingId === t.id ? (
                        <div className="flex gap-2">
                          <button onClick={saveEdit} className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700">Save</button>
                          <button onClick={cancelEdit} className="text-xs px-2 py-1 border rounded hover:bg-gray-50">Cancel</button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button onClick={()=>startEdit(t)} className="text-xs px-2 py-1 border rounded hover:bg-blue-50">Edit</button>
                          <button onClick={()=>deleteTariff(t.id)} className="text-xs px-2 py-1 border rounded hover:bg-red-50 text-red-600">Remove</button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
