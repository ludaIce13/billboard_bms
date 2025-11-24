import React, { useState } from 'react'
import Layout from '../components/Layout'
import client from '../api/client'
import { LOCATION_TYPES, SURFACE_AREA_BUCKETS, WARDS } from '../utils/constants'

export default function OperatorRequest() {
  const emptyItem = { ward_id: '', location_type: '', surface_area_bucket: '', gps_lat: '', gps_long: '' }
  const [operatorId, setOperatorId] = useState('')
  const [items, setItems] = useState([ { ...emptyItem } ])
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState('')
  const [loading, setLoading] = useState(false)

  const setItem = (idx, field, value) => {
    const copy = items.slice()
    copy[idx] = { ...copy[idx], [field]: value }
    setItems(copy)
  }
  const addItem = () => setItems([...items, { ...emptyItem }])
  const removeItem = (idx) => setItems(items.filter((_,i)=>i!==idx))

  const submit = async (e) => {
    e.preventDefault()
    setMsg('')
    setLoading(true)
    try {
      const payload = {
        operator_id: Number(operatorId),
        items: items.map(it => ({
          ward_id: Number(it.ward_id),
          location_type: it.location_type,
          surface_area_bucket: it.surface_area_bucket,
          gps_lat: Number(it.gps_lat),
          gps_long: Number(it.gps_long)
        }))
      }
      const res = await client.post('/license-requests', payload)
      setMsg(`✓ License request submitted successfully! Request #${res.data?.id}. It will be reviewed by the administrator.`)
      setMsgType('success')
      setItems([ { ...emptyItem } ])
      setOperatorId('')
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to submit request. Please check your input.')
      setMsgType('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Create License Request</h2>
            <p className="text-gray-600">Submit billboard license requests for multiple locations</p>
          </div>
          
          {msg && (
            <div className={`mb-6 p-4 rounded border ${
              msgType === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {msg}
            </div>
          )}
          
          <form onSubmit={submit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Operator ID <span className="text-red-500">*</span>
              </label>
              <input 
                className="border border-gray-300 p-3 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                value={operatorId} 
                onChange={e=>setOperatorId(e.target.value)} 
                placeholder="e.g. 1" 
                required
                type="number"
              />
              <p className="text-xs text-gray-500 mt-1">Your registered operator ID</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Billboard Locations</h3>
                <button 
                  type="button" 
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition" 
                  onClick={addItem}
                >
                  + Add Location
                </button>
              </div>
              
              {items.map((it,idx)=> (
                <div key={idx} className="p-5 bg-gray-50 rounded-lg border border-gray-300">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-700">Location #{idx + 1}</h4>
                    {items.length > 1 && (
                      <button 
                        type="button" 
                        className="text-sm text-red-600 hover:text-red-800" 
                        onClick={()=>removeItem(idx)}
                      >
                        ✕ Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ward <span className="text-red-500">*</span></label>
                      <select 
                        className="border border-gray-300 p-3 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                        value={it.ward_id} 
                        onChange={e=>setItem(idx,'ward_id', e.target.value)}
                        required
                      >
                        <option value="">Select Ward</option>
                        {WARDS.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location Type <span className="text-red-500">*</span></label>
                      <select 
                        className="border border-gray-300 p-3 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                        value={it.location_type} 
                        onChange={e=>setItem(idx,'location_type', e.target.value)}
                        required
                      >
                        <option value="">Select Location Type</option>
                        {LOCATION_TYPES.map(lt => <option key={lt} value={lt}>{lt}</option>)}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Surface Area <span className="text-red-500">*</span></label>
                      <select 
                        className="border border-gray-300 p-3 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                        value={it.surface_area_bucket} 
                        onChange={e=>setItem(idx,'surface_area_bucket', e.target.value)}
                        required
                      >
                        <option value="">Select Surface Area</option>
                        {SURFACE_AREA_BUCKETS.map(sa => <option key={sa} value={sa}>{sa}</option>)}
                      </select>
                    </div>
                    
                    <div className="md:col-span-2 grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">GPS Latitude <span className="text-red-500">*</span></label>
                        <input 
                          className="border border-gray-300 p-3 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                          placeholder="e.g. 8.484" 
                          value={it.gps_lat} 
                          onChange={e=>setItem(idx,'gps_lat', e.target.value)}
                          required
                          type="number"
                          step="any"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">GPS Longitude <span className="text-red-500">*</span></label>
                        <input 
                          className="border border-gray-300 p-3 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                          placeholder="e.g. -13.234" 
                          value={it.gps_long} 
                          onChange={e=>setItem(idx,'gps_long', e.target.value)}
                          required
                          type="number"
                          step="any"
                        />
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-blue-600">ℹ Plus Code will be automatically generated from GPS coordinates</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              className="w-full px-4 py-3 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:bg-gray-400 transition" 
              type="submit"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit License Request'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  )
}
