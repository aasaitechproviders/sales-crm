const BASE = ''  // Vite proxies /auth, /leads etc to Lambda in dev
                 // For prod deploy set VITE_API_URL in Cloudflare env vars

const getToken = () => localStorage.getItem('crm_token')

const req = async (method, path, body) => {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json()
  if (!data.success) throw new Error(data.message || 'Request failed')
  return data
}

export const api = {
  login:     (mobile, pin) => req('POST', '/auth/login', { mobile, pin }),
  changePin: (currentPin, newPin) => req('POST', '/auth/change-pin', { currentPin, newPin }),
  me:        () => req('GET', '/auth/me'),
  getAgents:   () => req('GET', '/agents'),
  createAgent: (data) => req('POST', '/agents', data),
  updateAgent: (id, data) => req('PATCH', `/agents/${id}`, data),
  toggleAgent: (id) => req('PATCH', `/agents/${id}/toggle`),
  resetPin:    (id, newPin) => req('PATCH', `/agents/${id}/reset-pin`, { newPin }),
  getLeads: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return req('GET', `/leads${q ? '?' + q : ''}`)
  },
  createLead: (data)     => req('POST', '/leads', data),
  getLead:    (id)       => req('GET', `/leads/${id}`),
  updateLead: (id, data) => req('PATCH', `/leads/${id}`, data),
  assignLead: (id, data) => req('POST', `/leads/${id}/assign`, data || {}),
  logVisit:       (data)   => req('POST', '/visits', data),
  getVisits:      (leadId) => req('GET', `/visits/lead/${leadId}`),
  todayFollowups: ()       => req('GET', '/visits/today'),
  presign:        (fileName, contentType) => req('POST', '/upload/presign', { fileName, contentType }),
  adminDashboard: () => req('GET', '/admin/dashboard'),
  adminFollowups: () => req('GET', '/admin/followups'),
}

export async function uploadPhoto(file) {
  const ext = file.name?.split('.').pop() || 'jpg'
  const { uploadUrl, publicUrl } = await api.presign(`photo.${ext}`, file.type)
  await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
  return publicUrl
}
