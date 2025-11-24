import React from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

export default function Navbar() {
  const { user, logout } = useAuth()
  return (
    <header className="border-b bg-white/70 backdrop-blur sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-bold text-blue-700">BMS</Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link className="hover:text-blue-700" to="/">Dashboard</Link>
          <Link className="hover:text-blue-700" to="/operator/register">Operator Register</Link>
          <Link className="hover:text-blue-700" to="/operator/request">License Request</Link>
          <Link className="hover:text-blue-700" to="/admin/operators">Operators</Link>
          <Link className="hover:text-blue-700" to="/admin/requests">Requests</Link>
          <Link className="hover:text-blue-700" to="/admin/tariffs">Tariffs</Link>
          <Link className="hover:text-blue-700" to="/admin/invoices">Invoices</Link>
          <Link className="hover:text-blue-700" to="/admin/licenses">Licenses</Link>
          {user ? (
            <button className="ml-2 px-3 py-1 bg-gray-100 rounded hover:bg-gray-200" onClick={logout}>Logout</button>
          ) : (
            <Link className="ml-2 px-3 py-1 bg-blue-600 text-white rounded" to="/login">Login</Link>
          )}
        </nav>
      </div>
    </header>
  )
}
