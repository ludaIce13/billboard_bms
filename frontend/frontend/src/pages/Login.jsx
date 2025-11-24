import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'
import useAuth from '../hooks/useAuth'

export default function Login() {
  const navigate = useNavigate()
  const { saveAuth } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await client.post('/auth/login', { email, password })
      saveAuth(res.data.token, res.data.user)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl mb-4 shadow-xl">
            <span className="text-4xl font-bold text-white">B</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Billboard Management</h1>
          <p className="text-gray-600">System Administration Portal</p>
        </div>
        
        <div className="bg-white p-10 rounded-2xl shadow-2xl border border-gray-100">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-500">Please sign in to your account</p>
          </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
            <p className="font-medium">Authentication Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}
        
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
            <input 
              className="border border-gray-300 p-3.5 w-full rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white" 
              placeholder="you@example.com" 
              type="email"
              value={email} 
              onChange={e=>setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <input 
              className="border border-gray-300 p-3.5 w-full rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white" 
              placeholder="••••••••" 
              type="password" 
              value={password} 
              onChange={e=>setPassword(e.target.value)}
              required 
            />
          </div>
          
          <button 
            className="w-full px-4 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5" 
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm">
          <p className="text-gray-600">New operator? <a href="/operator/register" className="text-blue-600 hover:text-blue-700 font-semibold">Register here</a></p>
        </div>
        </div>
      </div>
    </div>
  )
}
