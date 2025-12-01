import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import client from '../api/client'
import { LOCATION_TYPES, SURFACE_AREA_BUCKETS } from '../utils/constants'

export default function OperatorRequest() {
  const emptyItem = { location_type: '', surface_area_bucket: '', street_name: '', gps_lat: '', gps_long: '' }
  const [phoneNumber, setPhoneNumber] = useState('')
  const [operatorId, setOperatorId] = useState(null)
  const [councilId, setCouncilId] = useState('')
  const [councils, setCouncils] = useState([])
  const [items, setItems] = useState([ { ...emptyItem } ])
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState('')
  const [loading, setLoading] = useState(false)
  const [operatorStatus, setOperatorStatus] = useState(null)
  const [checkingOperator, setCheckingOperator] = useState(false)

  useEffect(() => {
    // Fetch councils from REV-MIS
    const loadCouncils = async () => {
      try {
        const res = await client.get('/councils')
        setCouncils(res.data || [])
      } catch (err) {
        console.error('Failed to load councils:', err)
      }
    }
    loadCouncils()
  }, [])

  // Check operator status when phone number changes
  useEffect(() => {
    const checkOperator = async () => {
      if (!phoneNumber || phoneNumber.length === 0) {
        setOperatorStatus(null)
        setOperatorId(null)
        return
      }
      
      setCheckingOperator(true)
      try {
        // Lookup operator by phone number
        const res = await client.get(`/operators/lookup?phone=${encodeURIComponent(phoneNumber)}`)
        setOperatorStatus(res.data)
        setOperatorId(res.data.id)
      } catch (err) {
        setOperatorStatus({ notFound: true })
        setOperatorId(null)
      } finally {
        setCheckingOperator(false)
      }
    }
    
    const timer = setTimeout(checkOperator, 500) // Debounce
    return () => clearTimeout(timer)
  }, [phoneNumber])

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
      if (!operatorId) {
        setMsg('Please enter a valid phone number for an approved operator')
        setMsgType('error')
        setLoading(false)
        return
      }

      const payload = {
        operator_id: operatorId,
        council_id: Number(councilId),
        items: items.map(it => ({
          location_type: it.location_type,
          surface_area_bucket: it.surface_area_bucket,
          street_name: it.street_name,
          gps_lat: Number(it.gps_lat),
          gps_long: Number(it.gps_long)
        }))
      }
      const res = await client.post('/license-requests', payload)
      setMsg(`✓ License request submitted successfully! Request #${res.data?.id}. It will be reviewed by the administrator.`)
      setMsgType('success')
      setItems([ { ...emptyItem } ])
      setPhoneNumber('')
      setOperatorId(null)
      setCouncilId('')
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
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Create License Request</h2>
            <p className="text-gray-600">Submit billboard license requests for multiple locations</p>
          </div>

          {/* Important Notice */}
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-600 rounded-r">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Important Notice</h3>
                <p className="text-sm text-blue-800">
                  <strong>Your operator account must be approved first</strong> before you can submit license requests. 
                  Please ensure you have registered as an operator and your application has been approved by the system administrator.
                </p>
              </div>
            </div>
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
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input 
                className="border border-gray-300 p-3 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                value={phoneNumber} 
                onChange={e=>setPhoneNumber(e.target.value)} 
                placeholder="e.g. +23276610612" 
                required
                type="tel"
              />
              <p className="text-xs text-gray-500 mt-1">Enter your registered phone number for verification</p>
              
              {/* Operator Status Feedback */}
              {checkingOperator && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                  🔍 Verifying phone number...
                </div>
              )}
              
              {operatorStatus && operatorStatus.notFound && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  ❌ Phone number {phoneNumber} not found. Please register as an operator first.
                </div>
              )}
              
              {operatorStatus && operatorStatus.status === 'PENDING' && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
                  ⏳ Your operator application is <strong>PENDING</strong> review. You cannot submit license requests until your application is approved.
                </div>
              )}
              
              {operatorStatus && operatorStatus.status === 'REJECTED' && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  ❌ Your operator application has been <strong>REJECTED</strong>. You cannot submit license requests. Please contact the administrator.
                </div>
              )}
              
              {operatorStatus && operatorStatus.status === 'APPROVED' && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                  ✅ Operator <strong>{operatorStatus.business_name}</strong> is APPROVED. You may proceed.
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Council <span className="text-red-500">*</span>
              </label>
              <select
                className="border border-gray-300 p-3 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={councilId}
                onChange={e=>setCouncilId(e.target.value)}
                required
              >
                <option value="">-- Select Council --</option>
                {councils.map(council => (
                  <option key={council.id} value={council.id}>
                    {council.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Select the local council where your billboards are located</p>
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
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Street Name <span className="text-red-500">*</span></label>
                      <input 
                        className="border border-gray-300 p-3 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                        placeholder="e.g. Peninsula Road, Waterloo Highway" 
                        value={it.street_name} 
                        onChange={e=>setItem(idx,'street_name', e.target.value)}
                        required
                        type="text"
                      />
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
              disabled={loading || !operatorStatus || operatorStatus.status !== 'APPROVED'}
            >
              {loading ? 'Submitting...' : 
               !operatorStatus || operatorStatus.status !== 'APPROVED' 
                 ? 'Operator Must Be Approved First' 
                 : 'Submit License Request'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  )
}
