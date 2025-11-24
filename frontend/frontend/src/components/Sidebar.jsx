import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const isActive = (path) => {
    return location.pathname === path 
      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md' 
      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900';
  };

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isManager = user?.role === 'MANAGER';
  const isBilling = user?.role === 'BILLING';
  const isOperator = user?.role === 'OPERATOR';
  const canManageTariffs = user?.role === 'SUPER_ADMIN' || user?.role === 'MANAGER';

  return (
    <div className="w-64 bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 flex flex-col h-screen shadow-sm">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">Billboard BMS</h1>
            <p className="text-xs text-gray-500">Management System</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      {user && (
        <div className="px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-700 font-semibold text-sm">{user.name?.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">{user.name}</div>
              <div className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full inline-block">{user.role}</div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <Link 
          to="/" 
          className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/')}`}
        >
          Dashboard
        </Link>

        {/* BILLING ROLE - Billing-focused menu */}
        {isBilling && (
          <>
            <div className="pt-4 pb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Billing
            </div>
            
            <Link 
              to="/admin/invoices" 
              className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/admin/invoices')}`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                </svg>
                Invoices
              </span>
            </Link>

            <Link 
              to="/admin/tariffs" 
              className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/admin/tariffs')}`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18M7 6h10M7 18h10" />
                </svg>
                Tariffs
              </span>
            </Link>
          </>
        )}

        {/* NON-BILLING ROLES - Full Menu */}
        {!isBilling && (
          <>
            <div className="pt-4 pb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Public
            </div>
            
            <Link 
              to="/operator/register" 
              className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/operator/register')}`}
            >
              Operator Registration
            </Link>

            {user && (
              <>
                <Link 
                  to="/operator/request" 
                  className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/operator/request')}`}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    New License Request
                  </span>
                </Link>

                <div className="pt-4 pb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Admin
                </div>

                {isSuperAdmin && (
                  <Link 
                    to="/admin/users" 
                    className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/admin/users')}`}
                  >
                    Users
                  </Link>
                )}

                <Link 
                  to="/admin/operators" 
                  className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/admin/operators')}`}
                >
                  Operators
                </Link>

                <Link 
                  to="/admin/requests" 
                  className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/admin/requests')}`}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Pending License Requests
                  </span>
                </Link>

                {canManageTariffs && (
                  <Link 
                    to="/admin/tariffs" 
                    className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/admin/tariffs')}`}
                  >
                    Tariffs
                  </Link>
                )}

                <Link 
                  to="/admin/invoices" 
                  className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/admin/invoices')}`}
                >
                  Invoices
                </Link>

                <Link 
                  to="/admin/licenses" 
                  className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/admin/licenses')}`}
                >
                  Licenses
                </Link>
              </>
            )}
          </>
        )}
      </nav>

      {/* Logout */}
      {user && (
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={handleLogout}
            className="w-full px-4 py-2.5 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium text-red-600 transition-all duration-200 border border-red-200"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
