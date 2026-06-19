import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import AgentDashboard from './pages/agent/Dashboard'
import AgentLeads from './pages/agent/Leads'
import AgentLeadDetail from './pages/agent/LeadDetail'
import LogVisit from './pages/agent/LogVisit'
import NewLead from './pages/agent/NewLead'
import AdminDashboard from './pages/admin/Dashboard'
import AdminAgents from './pages/admin/Agents'
import AdminLeads from './pages/admin/Leads'
import AdminLeadDetail from './pages/admin/LeadDetail'
import Layout from './components/Layout'

function FullScreenLoader() {
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0a0a0f', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ fontSize: 48 }}>👗</div>
      <div style={{ width: 36, height: 36, border: '3px solid #f59e0b', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

function RootRedirect() {
  const { user, loading } = useAuth()
  if (loading) return <FullScreenLoader />
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
}

function Protected({ role, children }) {
  const { user, loading } = useAuth()
  if (loading) return <FullScreenLoader />
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RootRedirect />} />
          <Route path="/dashboard"      element={<Protected role="agent"><Layout><AgentDashboard /></Layout></Protected>} />
          <Route path="/leads"          element={<Protected role="agent"><Layout><AgentLeads /></Layout></Protected>} />
          <Route path="/leads/new"      element={<Protected role="agent"><Layout><NewLead /></Layout></Protected>} />
          <Route path="/leads/:id"      element={<Protected role="agent"><Layout><AgentLeadDetail /></Layout></Protected>} />
          <Route path="/leads/:id/visit" element={<Protected role="agent"><Layout><LogVisit /></Layout></Protected>} />
          <Route path="/admin"          element={<Protected role="admin"><Layout><AdminDashboard /></Layout></Protected>} />
          <Route path="/admin/agents"   element={<Protected role="admin"><Layout><AdminAgents /></Layout></Protected>} />
          <Route path="/admin/leads"    element={<Protected role="admin"><Layout><AdminLeads /></Layout></Protected>} />
          <Route path="/admin/leads/:id" element={<Protected role="admin"><Layout><AdminLeadDetail /></Layout></Protected>} />
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}