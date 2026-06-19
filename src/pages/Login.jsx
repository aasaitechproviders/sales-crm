import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/Spinner'

export default function Login() {
  const [mobile, setMobile] = useState('')
  const [pin, setPin]       = useState('')
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  const handlePin = (val) => {
    if (val === 'del') { setPin(p => p.slice(0, -1)); return }
    if (pin.length < 4) setPin(p => p + val)
  }

  const handleSubmit = async () => {
    if (!mobile.trim()) { setError('Enter your mobile number'); return }
    if (pin.length !== 4) { setError('Enter 4-digit PIN'); return }
    setError(''); setLoading(true)
    try {
      const user = await login(mobile.trim(), pin)
      navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true })
    } catch (e) {
      setError(e.message || 'Login failed')
      setPin('')
    } finally { setLoading(false) }
  }

  const keys = [['1','2','3'],['4','5','6'],['7','8','9'],['','0','del']]

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">👗</div>
          <h1 className="text-2xl font-bold"><span className="text-amber-500">Boutique</span>AI</h1>
          <p className="text-[#7070a0] text-sm mt-1">Field Sales CRM</p>
        </div>

        {/* Mobile input */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-[#7070a0] uppercase tracking-wider mb-2 block">Mobile Number</label>
          <input
            type="tel" inputMode="numeric" maxLength={10}
            value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g,''))}
            placeholder="10-digit mobile"
            className="w-full bg-[#111118] border border-[#1e1e28] rounded-xl px-4 py-3.5 text-base text-center tracking-widest outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* PIN dots */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-[#7070a0] uppercase tracking-wider mb-3 block text-center">4-Digit PIN</label>
          <div className="flex justify-center gap-4 mb-6">
            {[0,1,2,3].map(i => (
              <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all ${i < pin.length ? 'bg-amber-500 border-amber-500' : 'border-[#3a3a50]'}`} />
            ))}
          </div>
          {/* Keypad */}
          <div className="space-y-2">
            {keys.map((row, ri) => (
              <div key={ri} className="flex gap-2 justify-center">
                {row.map((key, ki) => (
                  key === '' ? <div key={ki} className="w-20 h-14" /> :
                  <button
                    key={ki}
                    onClick={() => handlePin(key)}
                    className={`w-20 h-14 rounded-xl font-semibold text-lg transition-all active:scale-95 ${
                      key === 'del'
                        ? 'bg-[#1e1e28] text-[#7070a0] text-base'
                        : 'bg-[#111118] border border-[#1e1e28] text-white active:bg-[#1e1e28]'
                    }`}
                  >
                    {key === 'del' ? '⌫' : key}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}

        <button
          onClick={handleSubmit} disabled={loading}
          className="w-full bg-amber-500 text-black font-bold py-4 rounded-xl text-base active:bg-amber-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Spinner size="sm" /> : 'Login'}
        </button>
      </div>
    </div>
  )
}