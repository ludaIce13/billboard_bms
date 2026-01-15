import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './index.css'
import Dashboard from './pages/Dashboard'
import InvoiceTest from './pages/InvoiceTest'
import Login from './pages/Login'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import OperatorRegister from './pages/OperatorRegister'
import OperatorRequest from './pages/OperatorRequest'
import AdminOperators from './pages/admin/AdminOperators'
import AdminRequests from './pages/admin/AdminRequests'
import AdminTariffs from './pages/admin/AdminTariffs'
import AdminInvoices from './pages/admin/AdminInvoices'
import AdminLicenses from './pages/admin/AdminLicenses'
import AdminUsers from './pages/admin/AdminUsers'

ReactDOM.createRoot(document.getElementById('root')).render(
  <Router>
    <Routes>
      <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/login" element={<Login />} />
      <Route path="/operator/register" element={<OperatorRegister />} />
      <Route path="/operator/request" element={<ProtectedRoute><OperatorRequest /></ProtectedRoute>} />
      <Route path="/invoice-test" element={<Layout><InvoiceTest /></Layout>} />

      <Route path="/admin/operators" element={<ProtectedRoute><Layout><AdminOperators /></Layout></ProtectedRoute>} />
      <Route path="/admin/requests" element={<ProtectedRoute><Layout><AdminRequests /></Layout></ProtectedRoute>} />
      <Route path="/admin/tariffs" element={<ProtectedRoute><Layout><AdminTariffs /></Layout></ProtectedRoute>} />
      <Route path="/admin/invoices" element={<ProtectedRoute><Layout><AdminInvoices /></Layout></ProtectedRoute>} />
      <Route path="/admin/licenses" element={<ProtectedRoute><Layout><AdminLicenses /></Layout></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute><Layout><AdminUsers /></Layout></ProtectedRoute>} />
    </Routes>
  </Router>
)

