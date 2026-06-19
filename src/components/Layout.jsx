import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const agentNav = [
  { path: '/dashboard', icon: '📅', label: 'Today' },
  { path: '/leads',     icon: '📋', label: 'Leads' },
  { path: '/leads/new', icon: '➕', label: 'New Lead' },
]
const adminNav = [
  { path: '/admin',        icon: '📊', label: 'Dashboard' },
  { path: '/admin/leads',  icon: '📋', label: 'Leads' },
  { path: '/admin/agents', icon: '👥', label: 'Agents' },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const location = useNavigate ? useLocation() : { pathname: '/' }
  const navigate  = useNavigate()
  const nav = user?.role === 'admin' ? adminNav : agentNav

  const handleLogout = () => {
    if (confirm(`Logout, ${user?.name}?`)) logout()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: '#0a0a0f' }}>
      {/* Top bar — in flow, not fixed */}
      <div style={{ flexShrink: 0, height: 48, background: '#111118', borderBottom: '1px solid #1e1e28', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>👗</span>
          <span style={{ fontWeight: 700, fontSize: 14, color: '#f59e0b' }}>BoutiqueAI</span>
          <span style={{ fontSize: 11, background: '#1e1e28', padding: '2px 8px', borderRadius: 20, color: '#7070a0', marginLeft: 4 }}>CRM</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#7070a0' }}>{user?.name}</span>
          <span style={{ fontSize: 11, background: 'rgba(245,158,11,0.1)', color: '#f59e0b', padding: '2px 8px', borderRadius: 20, textTransform: 'capitalize' }}>{user?.role}</span>
          <button onClick={handleLogout} style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch' }}>
        {children}
      </div>

      {/* Bottom nav — in flow */}
      <div style={{ flexShrink: 0, background: '#111118', borderTop: '1px solid #1e1e28', display: 'flex', zIndex: 40 }}>
        {nav.map(item => {
          const active = location.pathname === item.path ||
            (item.path !== '/dashboard' && item.path !== '/admin' && location.pathname.startsWith(item.path))
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', padding: '10px 0', gap: 2, border: 'none',
                background: 'transparent', cursor: 'pointer',
                color: active ? '#f59e0b' : '#7070a0',
                borderTop: active ? '2px solid #f59e0b' : '2px solid transparent',
              }}
            >
              <span style={{ fontSize: 20, lineHeight: 1 }}>{item.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 600 }}>{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}