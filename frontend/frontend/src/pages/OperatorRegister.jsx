import React, { useState } from 'react'
import Layout from '../components/Layout'
import client from '../api/client'

export default function OperatorRegister() {
  const [form, setForm] = useState({ business_name: '', phone: '', email: '', address: '', category: 'NEW', business_license_status: 'PENDING' })
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [loading, setLoading] = useState(false)

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  
  const onSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setLoading(true)
    try {
      const res = await client.post('/operators', form)
      setMessage(`✓ Application submitted successfully! Status: ${res.data.status}. We will review your application shortly.`)
      setMessageType('success')
      setForm({ business_name: '', phone: '', email: '', address: '', category: 'NEW', business_license_status: 'PENDING' })
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to submit application. Please try again.')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Operator Self-Registration</h2>
            <p className="text-gray-600">Register your billboard business to start managing licenses</p>
          </div>
          
          {message && (
            <div className={`mb-6 p-4 rounded border ${
              messageType === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {message}
            </div>
          )}
          
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name <span className="text-red-500">*</span>
              </label>
              <input 
                className="border border-gray-300 p-3 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder="e.g. Bright Ads Ltd." 
                name="business_name" 
                value={form.business_name} 
                onChange={onChange}
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input 
                className="border border-gray-300 p-3 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder="+232 77 000 0000" 
                name="phone" 
                value={form.phone} 
                onChange={onChange}
                required 
              />
              <p className="text-sm text-gray-500 mt-1">Sierra Leone format: +232...</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input 
                className="border border-gray-300 p-3 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder="contact@business.com" 
                type="email"
                name="email" 
                value={form.email} 
                onChange={onChange}
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registered Office Address <span className="text-red-500">*</span>
              </label>
              <textarea 
                className="border border-gray-300 p-3 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder="24 Wilkinson Road, Freetown" 
                name="address" 
                value={form.address} 
                onChange={onChange}
                rows="3"
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category <span className="text-red-500">*</span></label>
              <select
                className="border border-gray-300 p-3 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                name="category"
                value={form.category}
                onChange={onChange}
                required
              >
                <option value="NEW">New operator</option>
                <option value="EXISTING">Existing operator</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">WARDC Business License <span className="text-red-500">*</span></label>
              <select
                className="border border-gray-300 p-3 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                name="business_license_status"
                value={form.business_license_status}
                onChange={onChange}
                required
              >
                <option value="PAID">Yes</option>
                <option value="PENDING">No</option>
              </select>
            </div>
            
            <button 
              className="w-full px-4 py-3 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:bg-gray-400 transition" 
              type="submit"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
          
          <div className="mt-6 pt-6 border-t text-sm text-gray-600">
            <p><strong>Note:</strong> Your application will be reviewed by our team. You will be notified once approved.</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
