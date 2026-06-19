import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../api'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('crm_token')
    if (!token) { setLoading(false); return }
    // Validate token with server on every mount/refresh
    api.me()
      .then(d => {
        setUser(d.user)
        localStorage.setItem('crm_user', JSON.stringify(d.user))
      })
      .catch(() => {
        // Token invalid/expired — clear and force login
        localStorage.removeItem('crm_token')
        localStorage.removeItem('crm_user')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (mobile, pin) => {
    const data = await api.login(mobile, pin)
    localStorage.setItem('crm_token', data.token)
    localStorage.setItem('crm_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    localStorage.removeItem('crm_token')
    localStorage.removeItem('crm_user')
    setUser(null)
  }

  return (
    <AuthCtx.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => useContext(AuthCtx)