import { useState, useEffect } from 'react'
import { api } from '../../api'
import Spinner from '../../components/Spinner'

export default function AdminAgents() {
  const [agents, setAgents]   = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]       = useState({ name:'', mobile:'', pin:'' })
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')
  const [resetId, setResetId] = useState(null)
  const [newPin, setNewPin]   = useState('')

  const load = () => api.getAgents().then(d => setAgents(d.agents)).catch(console.error).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const createAgent = async () => {
    if (!form.name || !form.mobile || !form.pin) { setError('All fields required'); return }
    if (!/^\d{4}$/.test(form.pin)) { setError('PIN must be 4 digits'); return }
    setSaving(true); setError('')
    try {
      await api.createAgent(form)
      setForm({ name:'', mobile:'', pin:'' })
      setShowForm(false)
      load()
    } catch(e) { setError(e.message) }
    finally { setSaving(false) }
  }

  const toggle = async (id) => {
    try { await api.toggleAgent(id); load() } catch(e) { alert(e.message) }
  }

  const doResetPin = async (id) => {
    if (!/^\d{4}$/.test(newPin)) { alert('PIN must be 4 digits'); return }
    try { await api.resetPin(id, newPin); setResetId(null); setNewPin(''); alert('PIN reset!') } catch(e) { alert(e.message) }
  }

  const inp = "w-full bg-[#111118] border border-[#1e1e28] rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-500"

  if (loading) return <div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div>

  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-bold text-lg">Agents ({agents.length})</h1>
        <button onClick={() => setShowForm(f => !f)}
          className="bg-amber-500 text-black font-bold px-4 py-2 rounded-xl text-sm">
          {showForm ? 'Cancel' : '+ Add Agent'}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-[#111118] border border-[#1e1e28] rounded-xl p-4 mb-5 space-y-3">
          <p className="font-semibold text-sm mb-2">New Agent</p>
          <input value={form.name} onChange={e => setForm(f => ({...f, name:e.target.value}))}
            placeholder="Full name" className={inp} />
          <input value={form.mobile} onChange={e => setForm(f => ({...f, mobile:e.target.value}))}
            placeholder="Mobile number" type="tel" inputMode="numeric" className={inp} />
          <input value={form.pin} onChange={e => setForm(f => ({...f, pin:e.target.value}))}
            placeholder="Initial 4-digit PIN" type="password" inputMode="numeric" maxLength={4} className={inp} />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button onClick={createAgent} disabled={saving}
            className="w-full bg-amber-500 text-black font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2">
            {saving ? <Spinner size="sm" /> : 'Create Agent'}
          </button>
          <p className="text-xs text-[#7070a0]">Agent will be asked to change PIN on first login.</p>
        </div>
      )}

      {/* Agent list */}
      {!agents.length
        ? <div className="text-center py-12 text-[#7070a0]"><p className="text-4xl mb-3">👥</p><p>No agents yet</p></div>
        : <div className="space-y-3">
            {agents.map(a => (
              <div key={a._id} className="bg-[#111118] border border-[#1e1e28] rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold">{a.name}</p>
                    <p className="text-xs text-[#7070a0]">{a.mobile}</p>
                    <p className="text-xs text-[#7070a0] mt-0.5">Created {new Date(a.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${a.isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {a.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggle(a._id)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors ${a.isActive ? 'border-red-500/30 text-red-400' : 'border-green-500/30 text-green-400'}`}>
                    {a.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => setResetId(a._id)}
                    className="flex-1 py-2 rounded-lg text-xs font-semibold border border-[#1e1e28] text-[#7070a0]">
                    Reset PIN
                  </button>
                </div>
                {/* Reset PIN inline */}
                {resetId === a._id && (
                  <div className="mt-3 flex gap-2">
                    <input value={newPin} onChange={e => setNewPin(e.target.value)}
                      placeholder="New 4-digit PIN" type="password" inputMode="numeric" maxLength={4}
                      className="flex-1 bg-[#1e1e28] border border-[#2a2a3a] rounded-lg px-3 py-2 text-sm outline-none" />
                    <button onClick={() => doResetPin(a._id)} className="bg-amber-500 text-black font-bold px-4 rounded-lg text-sm">Set</button>
                    <button onClick={() => { setResetId(null); setNewPin('') }} className="text-[#7070a0] px-2">✕</button>
                  </div>
                )}
              </div>
            ))}
          </div>
      }
    </div>
  )
}