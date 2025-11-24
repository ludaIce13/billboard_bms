import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import client from '../api/client'

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
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white p-8 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-blue-100">
              {user ? `Welcome back, ${user.name}` : 'Welcome to BMS - Please login to continue'}
            </p>
          </div>
          {user && (
            <div className="text-right">
              <div className="text-sm text-blue-200">Role</div>
              <div className="text-lg font-semibold">{user.role}</div>
            </div>
          )}
        </div>
      </div>

      {/* SUPER ADMIN Overview Dashboard */}
      {isSuperAdmin && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow border border-gray-200 p-6 flex flex-col justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Operators</p>
                <p className="text-3xl font-bold text-gray-900">{stats.operators}</p>
              </div>
              <Link to="/admin/operators" className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium">View operators →</Link>
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-200 p-6 flex flex-col justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Pending License Items</p>
                <p className="text-3xl font-bold text-amber-600">{stats.pendingRequests}</p>
              </div>
              <Link to="/admin/requests" className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium">Review requests →</Link>
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-200 p-6 flex flex-col justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Approved License Items</p>
                <p className="text-3xl font-bold text-emerald-600">{stats.approvedRequests}</p>
              </div>
              <Link to="/admin/requests" className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium">View approvals →</Link>
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-200 p-6 flex flex-col justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Invoices</p>
                <p className="text-3xl font-bold text-indigo-600">{stats.invoices}</p>
              </div>
              <Link to="/admin/invoices" className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium">View invoices →</Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">System Overview</h2>
              <ul className="space-y-3 text-sm text-gray-700">
                <li>• Monitor operator approvals and license workflows.</li>
                <li>• Oversee billing activity and REVMIS invoice integrations.</li>
                <li>• Ensure roles and access are correctly configured.</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Super Admin Quick Actions</h2>
              <div className="space-y-3">
                <Link to="/admin/users" className="flex items-center justify-between p-3 rounded-lg border hover:border-blue-500 hover:bg-blue-50 transition">
                  <span className="text-sm font-medium text-gray-800">Manage System Users</span>
                  <span className="text-xs text-blue-600">Open →</span>
                </Link>
                <Link to="/admin/operators" className="flex items-center justify-between p-3 rounded-lg border hover:border-purple-500 hover:bg-purple-50 transition">
                  <span className="text-sm font-medium text-gray-800">Review Operators</span>
                  <span className="text-xs text-purple-600">Open →</span>
                </Link>
                <Link to="/admin/requests" className="flex items-center justify-between p-3 rounded-lg border hover:border-emerald-500 hover:bg-emerald-50 transition">
                  <span className="text-sm font-medium text-gray-800">Approve License Requests</span>
                  <span className="text-xs text-emerald-600">Open →</span>
                </Link>
                <Link to="/admin/invoices" className="flex items-center justify-between p-3 rounded-lg border hover:border-orange-500 hover:bg-orange-50 transition">
                  <span className="text-sm font-medium text-gray-800">Monitor Invoices</span>
                  <span className="text-xs text-orange-600">Open →</span>
                </Link>
              </div>
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
                  {loadingBillingStats ? '…' : billingStats.pendingInvoiceRequests}
                </p>
              </div>
              <Link to="/admin/invoices" className="mt-4 text-xs text-blue-600 hover:text-blue-800 font-medium">View pending →</Link>
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-200 p-5 flex flex-col justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Generated Invoices</p>
                <p className="text-3xl font-bold text-indigo-600">
                  {loadingBillingStats ? '…' : billingStats.generatedInvoices}
                </p>
              </div>
              <Link to="/admin/invoices" className="mt-4 text-xs text-blue-600 hover:text-blue-800 font-medium">Open invoices →</Link>
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-200 p-5 flex flex-col justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Sent to REVMIS</p>
                <p className="text-3xl font-bold text-emerald-600">
                  {loadingBillingStats ? '…' : billingStats.sentToRevmis}
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
