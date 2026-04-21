import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Leads from './pages/Leads'
import Properties from './pages/Properties'
import Clients from './pages/Clients'
import Deals from './pages/Deals'
import Reports from './pages/Reports'
import Agents from './pages/Agents'
import Layout from './components/Layout'

const GUEST_USER = {
  id: 0,
  name: 'Guest',
  email: 'guest@shared.local',
  role: 'shared workspace',
}

function ensureDemoSession() {
  const existingUser = localStorage.getItem('user')

  if (!existingUser) {
    localStorage.removeItem('token')
    localStorage.setItem('user', JSON.stringify(GUEST_USER))
  }
}

function DemoSessionRoute() {
  ensureDemoSession()
  return <Outlet />
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1a1a2e', color: '#e2e8f0', border: '1px solid #2d3748', borderRadius: '8px', fontSize: '13px' } }} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<DemoSessionRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="leads" element={<Leads />} />
            <Route path="properties" element={<Properties />} />
            <Route path="clients" element={<Clients />} />
            <Route path="deals" element={<Deals />} />
            <Route path="agents" element={<Agents />} />
            <Route path="reports" element={<Reports />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
