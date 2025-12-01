import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import client from '../api/client'
import { formatNumber } from '../utils/formatNumber'

export default function Dashboard() {
  const { user } = useAuth()
  const isBilling = user?.role === 'BILLING'
  const isSuperAdmin = user?.role === 'SUPER_ADMIN'

  const [stats, setStats] = useState({
    operators: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    invoices: 0,
    licenses: 0,
  })
  const [billingStats, setBillingStats] = useState({
    pendingInvoiceRequests: 0,
    generatedInvoices: 0,
    sentToRevmis: 0,
  })
  const [loadingStats, setLoadingStats] = useState(false)
  const [loadingBillingStats, setLoadingBillingStats] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!isSuperAdmin) return
      setLoadingStats(true)
      try {
        const [opsRes, reqRes, invRes, licRes] = await Promise.all([
          client.get('/operators'),
          client.get('/license-requests'),
          client.get('/invoices'),
          client.get('/licenses'),
        ])

        const requests = reqRes.data || []
        const pending = requests.flatMap(r => r.license_request_items || r.licenseRequestItems || [])
          .filter(it => it.status === 'PENDING').length
        const approved = requests.flatMap(r => r.license_request_items || r.licenseRequestItems || [])
          .filter(it => it.status === 'APPROVED').length

        setStats({
          operators: (opsRes.data || []).length,
          pendingRequests: pending,
          approvedRequests: approved,
          invoices: (invRes.data || []).length,
          licenses: (licRes.data || []).length,
        })
      } catch (e) {
        // Silent fail for overview; detailed errors are shown on each module page
      } finally {
        setLoadingStats(false)
      }
    }

    load()
  }, [isSuperAdmin])

  // Load Billing-specific stats
  useEffect(() => {
    const loadBilling = async () => {
      if (!isBilling || isSuperAdmin) return
      setLoadingBillingStats(true)
      try {
        const [reqRes, invRes] = await Promise.all([
          client.get('/license-requests'),
          client.get('/invoices'),
        ])

        const requests = reqRes.data || []
        const invoices = invRes.data || []

        const pendingInvoiceRequests = requests.filter(r => {
          const items = r.license_request_items || r.licenseRequestItems || []
          const hasApprovedItem = items.some(it => it.status === 'APPROVED')
          const hasInvoice = invoices.some(inv => inv.request_id === r.id)
          return hasApprovedItem && !hasInvoice
        }).length

        const generatedInvoices = invoices.length
        const sentToRevmis = invoices.filter(inv => inv.revmis_status === 'sent').length

        setBillingStats({ pendingInvoiceRequests, generatedInvoices, sentToRevmis })
      } catch (e) {
        // Silent fail for overview
      } finally {
        setLoadingBillingStats(false)
      }
    }

    loadBilling()
  }, [isBilling, isSuperAdmin])

  return (
    <div>
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 mb-8 shadow-md">
        <h1 className="text-2xl font-bold text-white mb-1">Welcome back!</h1>
        <p className="text-blue-100 text-sm">{user ? `Here's what's happening with your billboard operations today.` : 'Welcome to Billboard BMS'}</p>
      </div>

      {/* SUPER ADMIN Overview Dashboard */}
      {isSuperAdmin && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Operators - Blue */}
            <div className="bg-white rounded-lg p-6 shadow border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="text-gray-600 text-sm font-medium">Total Operators</div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{formatNumber(stats.operators)}</div>
              <div className="text-gray-500 text-xs">+12% from last month</div>
            </div>

            {/* Pending Licenses - Amber */}
            <div className="bg-white rounded-lg p-6 shadow border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="text-gray-600 text-sm font-medium">Pending Licenses</div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{formatNumber(stats.pendingRequests)}</div>
              <div className="text-gray-500 text-xs">+1% from last month</div>
            </div>

            {/* Approved Licenses - Blue */}
            <div className="bg-white rounded-lg p-6 shadow border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="text-gray-600 text-sm font-medium">Approved Licenses</div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{formatNumber(stats.approvedRequests)}</div>
              <div className="text-gray-500 text-xs">+17% from last month</div>
            </div>

            {/* Total Invoices - Green */}
            <div className="bg-white rounded-lg p-6 shadow border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="text-gray-600 text-sm font-medium">Total Invoices</div>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{formatNumber(stats.invoices)}</div>
              <div className="text-gray-500 text-xs">+12% from last month</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow border border-gray-200 p-8">
            <h2 className="text-xl font-bold mb-2 text-gray-900">Quick Actions</h2>
            <p className="text-gray-600 text-sm mb-6">Common tasks</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link to="/admin/requests" className="group bg-blue-600 hover:bg-blue-700 rounded-lg p-6 shadow transition-all duration-200">
                <div className="text-white font-semibold mb-1">Review Pending Licenses</div>
                <div className="text-blue-100 text-sm">Approve or reject license requests</div>
              </Link>
              <Link to="/admin/invoices" className="group bg-emerald-600 hover:bg-emerald-700 rounded-lg p-6 shadow transition-all duration-200">
                <div className="text-white font-semibold mb-1">Process Invoices</div>
                <div className="text-emerald-100 text-sm">Generate and send invoices</div>
              </Link>
              <Link to="/admin/operators" className="group bg-blue-600 hover:bg-blue-700 rounded-lg p-6 shadow transition-all duration-200">
                <div className="text-white font-semibold mb-1">Manage Operators</div>
                <div className="text-blue-100 text-sm">Review operator applications</div>
              </Link>
              <Link to="/admin/tariffs" className="group bg-emerald-600 hover:bg-emerald-700 rounded-lg p-6 shadow transition-all duration-200">
                <div className="text-white font-semibold mb-1">Manage Tariffs</div>
                <div className="text-emerald-100 text-sm">Update tariff rates</div>
              </Link>
            </div>
          </div>
        </>
      )}

      {/* BILLING User Dashboard */}
      {isBilling && !isSuperAdmin && (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow border border-gray-200 p-5 flex flex-col justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Pending Invoice Requests</p>
                <p className="text-3xl font-bold text-amber-600">
                  {loadingBillingStats ? '…' : formatNumber(billingStats.pendingInvoiceRequests)}
                </p>
              </div>
              <Link to="/admin/invoices" className="mt-4 text-xs text-blue-600 hover:text-blue-800 font-medium">View pending →</Link>
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-200 p-5 flex flex-col justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Generated Invoices</p>
                <p className="text-3xl font-bold text-indigo-600">
                  {loadingBillingStats ? '…' : formatNumber(billingStats.generatedInvoices)}
                </p>
              </div>
              <Link to="/admin/invoices" className="mt-4 text-xs text-blue-600 hover:text-blue-800 font-medium">Open invoices →</Link>
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-200 p-5 flex flex-col justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Sent to REVMIS</p>
                <p className="text-3xl font-bold text-emerald-600">
                  {loadingBillingStats ? '…' : formatNumber(billingStats.sentToRevmis)}
                </p>
              </div>
              <Link to="/admin/invoices" className="mt-4 text-xs text-blue-600 hover:text-blue-800 font-medium">Review status →</Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Link to="/admin/invoices" className="group bg-white p-8 rounded-xl border-2 border-gray-200 hover:border-orange-500 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-500 transition-colors">
                <svg className="w-8 h-8 text-orange-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-2xl mb-2 text-gray-800">Invoices</h3>
              <p className="text-gray-500">Generate invoices and send them to REVMIS from one place.</p>
            </Link>

            <Link to="/admin/tariffs" className="group bg-white p-8 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-500 transition-colors">
                <svg className="w-8 h-8 text-blue-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18M7 6h10M7 18h10" />
                </svg>
              </div>
              <h3 className="font-bold text-2xl mb-2 text-gray-800">Tariff Table</h3>
              <p className="text-gray-500">Manage billboard tariffs used to calculate invoice amounts.</p>
            </Link>
          </div>
        </>
      )}

      {/* Non-Billing User Dashboard (Managers / Operators only) */}
      {!isBilling && !isSuperAdmin && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/operator/register" className="group bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-500 transition-colors">
            <svg className="w-6 h-6 text-blue-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="font-bold text-lg mb-2 text-gray-800">Operator Registration</h3>
          <p className="text-sm text-gray-500">Register as a new billboard operator</p>
        </Link>
        
        <Link to="/operator/request" className="group bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-green-500 hover:shadow-xl transition-all duration-300">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-500 transition-colors">
            <svg className="w-6 h-6 text-green-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="font-bold text-lg mb-2 text-gray-800">License Request</h3>
          <p className="text-sm text-gray-500">Submit billboard license requests</p>
        </Link>
        
        <Link to="/admin/operators" className="group bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-purple-500 hover:shadow-xl transition-all duration-300">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-500 transition-colors">
            <svg className="w-6 h-6 text-purple-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-bold text-lg mb-2 text-gray-800">Review Operators</h3>
          <p className="text-sm text-gray-500">Approve or reject applications</p>
        </Link>
        
        <Link to="/admin/invoices" className="group bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-orange-500 hover:shadow-xl transition-all duration-300">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-500 transition-colors">
            <svg className="w-6 h-6 text-orange-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
            </svg>
          </div>
          <h3 className="font-bold text-lg mb-2 text-gray-800">Invoices</h3>
          <p className="text-sm text-gray-500">View and manage invoices</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">System Features</h2>
          <ul className="space-y-4">
            <li className="flex items-start">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-gray-700">Operator self-registration and approval workflow</span>
            </li>
            <li className="flex items-start">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-gray-700">Multi-location billboard license requests</span>
            </li>
            <li className="flex items-start">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-gray-700">Tariff-based invoice generation with GST</span>
            </li>
            <li className="flex items-start">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-gray-700">REVMIS integration ready</span>
            </li>
            <li className="flex items-start">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-gray-700">Role-based access control</span>
            </li>
          </ul>
        </div>

        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/admin/requests" className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-blue-50 hover:to-blue-100 transition-all group">
              <span className="font-medium text-gray-700 group-hover:text-blue-700">License Requests Review</span>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link to="/admin/tariffs" className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-blue-50 hover:to-blue-100 transition-all group">
              <span className="font-medium text-gray-700 group-hover:text-blue-700">Tariff Management</span>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link to="/admin/licenses" className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-blue-50 hover:to-blue-100 transition-all group">
              <span className="font-medium text-gray-700 group-hover:text-blue-700">Issued Licenses</span>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link to="/invoice-test" className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-blue-50 hover:to-blue-100 transition-all group">
              <span className="font-medium text-gray-700 group-hover:text-blue-700">Test REVMIS Integration</span>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  )
}
