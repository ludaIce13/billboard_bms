import React from 'react'
import Sidebar from './Sidebar'
import useAuth from '../hooks/useAuth'

export default function Layout({ children }) {
  const { user } = useAuth()
  
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Top Header Bar */}
        {user && (
          <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                <div className="text-xs text-gray-500">{user.role}</div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">{user.name?.charAt(0).toUpperCase()}</span>
              </div>
            </div>
          </div>
        )}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
