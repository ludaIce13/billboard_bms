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
      ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm' 
      : 'text-white/70 hover:bg-white/10 hover:text-white';
  };

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isManager = user?.role === 'MANAGER';
  const isBilling = user?.role === 'BILLING';
  const isOperator = user?.role === 'OPERATOR';
  const canManageTariffs = user?.role === 'SUPER_ADMIN' || user?.role === 'MANAGER';

  return (
    <div className="w-64 bg-gradient-to-b from-blue-600 via-teal-700 to-emerald-800 flex flex-col h-screen shadow-lg">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Billboard BMS</h1>
            <p className="text-xs text-white/70">Management System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        <Link 
          to="/" 
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/')}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </Link>

        {/* BILLING ROLE - Billing-focused menu */}
        {isBilling && (
          <>
            <div className="pt-4 pb-2 px-4 text-xs font-semibold text-white/50 uppercase tracking-wider">
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
            <div className="pt-4 pb-2 px-4 text-xs font-semibold text-white/50 uppercase tracking-wider">
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

                <div className="pt-4 pb-2 px-4 text-xs font-semibold text-white/50 uppercase tracking-wider">
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
        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="w-full px-4 py-2.5 bg-white/10 hover:bg-red-600 rounded-lg text-sm font-medium text-white transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
