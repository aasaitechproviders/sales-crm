import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api, uploadPhoto } from '../../api'
import Spinner from '../../components/Spinner'

const OUTCOMES = ['Interested','Not Interested','Follow Up','Demo Given','Onboarded']
const LANGUAGES = [
  { code: 'en-IN', label: 'English (India)' },
  { code: 'ta-IN', label: 'தமிழ் (Tamil)' },
  { code: 'hi-IN', label: 'हिंदी (Hindi)' },
  { code: 'te-IN', label: 'తెలుగు (Telugu)' },
  { code: 'kn-IN', label: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ml-IN', label: 'മലയാളം (Malayalam)' },
]

export default function LogVisit() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const photoRef = useRef()

  const [lead, setLead]           = useState(null)
  const [outcome, setOutcome]     = useState('')
  const [comments, setComments]   = useState('')
  const [demoGiven, setDemoGiven] = useState(false)
  const [poc, setPoc]             = useState({ name: '', mobile: '' })
  const [demoMobile, setDemoMobile] = useState('')
  const [followUp, setFollowUp]   = useState('')
  const [photo, setPhoto]         = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const [gps, setGps]             = useState(null)
  const [gpsError, setGpsError]   = useState('')
  const [gpsLoading, setGpsLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState('')

  // Voice
  const [listening, setListening]     = useState(false)
  const [lang, setLang]               = useState('en-IN')
  const [showLangPicker, setShowLangPicker] = useState(false)
  const [interim, setInterim]         = useState('')
  const recogRef  = useRef(null)
  const activeRef = useRef(false)

  useEffect(() => {
    api.getLead(id).then(d => setLead(d.lead)).catch(console.error)
    captureGPS()
    // Ask mic permission once silently
    navigator.mediaDevices?.getUserMedia({ audio: true })
      .then(s => s.getTracks().forEach(t => t.stop()))
      .catch(() => {})
  }, [id])

  useEffect(() => { return () => { activeRef.current = false; stopRecognition() } }, [])

  const buildRecognition = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return null
    const r = new SR()
    r.lang = lang; r.continuous = true; r.interimResults = true; r.maxAlternatives = 1
    r.onstart  = () => { setListening(true); setInterim('') }
    r.onend    = () => {
      setListening(false); setInterim('')
      if (activeRef.current) { try { r.start() } catch {} }
    }
    r.onerror  = (e) => {
      if (e.error === 'no-speech') return
      setListening(false); setInterim(''); activeRef.current = false
    }
    r.onresult = (e) => {
      let final = '', inter = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript + ' '
        else inter += e.results[i][0].transcript
      }
      if (final) setComments(prev => (prev + final).trimStart())
      setInterim(inter)
    }
    return r
  }

  const toggleMic = () => {
    if (activeRef.current) {
      activeRef.current = false; stopRecognition()
    } else {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SR) { alert('Voice not supported. Use Chrome.'); return }
      activeRef.current = true
      const r = buildRecognition(); recogRef.current = r
      try { r.start() } catch {}
    }
  }

  const stopRecognition = () => {
    try { recogRef.current?.stop() } catch {}
    try { recogRef.current?.abort() } catch {}
    recogRef.current = null; setListening(false); setInterim('')
  }

  const switchLang = (code) => {
    setLang(code); setShowLangPicker(false)
    if (activeRef.current) {
      stopRecognition()
      setTimeout(() => {
        const r = buildRecognition(); recogRef.current = r
        try { r.start() } catch {}
      }, 300)
    }
  }

  const captureGPS = () => {
    if (!navigator.geolocation) { setGpsError('GPS not supported'); return }
    setGpsLoading(true); setGpsError('')
    navigator.geolocation.getCurrentPosition(
      pos => { setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }); setGpsLoading(false) },
      ()  => { setGpsError('GPS denied — enable location and retry'); setGpsLoading(false) },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  }

  const handlePhoto = (e) => {
    const file = e.target.files?.[0]; if (!file) return
    setPhoto(URL.createObjectURL(file)); setPhotoFile(file)
  }

  const validate = () => {
    if (!outcome)         return 'Select an outcome'
    if (!comments.trim()) return 'Add comments (or use voice)'
    if (!followUp)        return 'Select next follow-up date'
    if (!gps)             return 'GPS required — tap Retry GPS'
    if (!photoFile)       return 'Meeting photo is mandatory'
    return null
  }

  const submit = async () => {
    activeRef.current = false; stopRecognition()
    const e = validate(); if (e) { setError(e); return }
    setError(''); setSubmitting(true)
    try {
      const url = await uploadPhoto(photoFile)
      await api.logVisit({
        leadId: id, outcome, comments: comments.trim(), demoGiven,
        pointOfContact: poc.name ? poc : null,
        demoLoginMobile: demoGiven ? demoMobile : null,
        nextFollowUpDate: new Date(followUp).toISOString(),
        gps, photoUrl: url,
      })
      navigate(`/leads/${id}`, { replace: true })
    } catch(e) { setError(e.message || 'Submit failed. Try again.') }
    finally { setSubmitting(false) }
  }

  const inp = "w-full bg-[#111118] border border-[#1e1e28] rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-500"
  const selectedLang = LANGUAGES.find(l => l.code === lang)

  return (
    <div style={{ padding: '16px 16px 40px' }}>
      <button onClick={() => navigate(-1)} className="text-[#7070a0] text-sm mb-3 block">← Back</button>
      <h1 className="font-bold text-lg mb-1">Log Visit</h1>
      {lead && <p className="text-sm text-[#7070a0] mb-5 truncate">{lead.businessName}</p>}

      {/* GPS */}
      <div className={`rounded-xl p-3 mb-4 flex items-center justify-between ${gps ? 'bg-green-500/10 border border-green-500/20' : 'bg-[#1e1e28] border border-[#2a2a3a]'}`}>
        <div>
          <p className={`text-sm font-semibold ${gps ? 'text-green-400' : 'text-[#9090b0]'}`}>
            {gpsLoading ? '📍 Getting location...' : gps ? '📍 Location captured ✓' : '📍 Location not captured'}
          </p>
          {gps && <p className="text-[10px] text-[#7070a0] mt-0.5">{gps.lat.toFixed(5)}, {gps.lng.toFixed(5)} · ±{Math.round(gps.accuracy)}m</p>}
          {gpsError && <p className="text-xs text-orange-400 mt-0.5">{gpsError}</p>}
        </div>
        {gpsLoading
          ? <Spinner size="sm" />
          : !gps && <button onClick={captureGPS} className="bg-amber-500/10 text-amber-500 text-xs font-semibold px-3 py-1.5 rounded-lg">Retry</button>
        }
      </div>

      {/* Photo */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-[#7070a0] uppercase tracking-wider mb-2 block">Meeting Photo <span className="text-red-400">*</span></label>
        {photo
          ? <div style={{ position: 'relative' }}>
              <img src={photo} alt="visit" style={{ width: '100%', borderRadius: 12, objectFit: 'cover', maxHeight: 200 }} />
              <button onClick={() => { setPhoto(null); setPhotoFile(null) }}
                style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', color: '#fff', width: 28, height: 28, borderRadius: '50%', border: 'none', fontSize: 14, cursor: 'pointer' }}>✕</button>
            </div>
          : <button onClick={() => photoRef.current?.click()}
              style={{ width: '100%', height: 112, background: '#111118', border: '2px dashed #1e1e28', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#7070a0', cursor: 'pointer' }}>
              <span style={{ fontSize: 32 }}>📷</span>
              <span style={{ fontSize: 14, fontWeight: 500 }}>Take Photo</span>
              <span style={{ fontSize: 11 }}>Camera mandatory</span>
            </button>
        }
        <input ref={photoRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{ display: 'none' }} />
      </div>

      {/* Outcome */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-[#7070a0] uppercase tracking-wider mb-2 block">Outcome <span className="text-red-400">*</span></label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {OUTCOMES.map(o => (
            <button key={o} onClick={() => setOutcome(o)}
              style={{
                padding: '12px 8px', borderRadius: 12, fontSize: 13, fontWeight: 600,
                border: outcome===o ? '1px solid #f59e0b' : '1px solid #1e1e28',
                background: outcome===o ? 'rgba(245,158,11,0.1)' : '#111118',
                color: outcome===o ? '#f59e0b' : '#9090b0', cursor: 'pointer',
              }}>
              {o}
            </button>
          ))}
        </div>
      </div>

      {/* Comments + Voice */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-[#7070a0] uppercase tracking-wider mb-2 block">Comments <span className="text-red-400">*</span></label>

        {/* Voice row */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <button onClick={toggleMic}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px',
              borderRadius: 12, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
              background: listening ? '#ef4444' : '#1e1e28',
              color: listening ? '#fff' : '#9090b0',
              flexShrink: 0,
            }}>
            <span style={{ animation: listening ? 'pulse 1s infinite' : 'none' }}>🎤</span>
            {listening ? 'Stop' : 'Speak'}
          </button>

          {/* Language picker */}
          <div style={{ flex: 1, position: 'relative' }}>
            <button onClick={() => setShowLangPicker(p => !p)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1e1e28', border: '1px solid #2a2a3a', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: '#d0d0e0', cursor: 'pointer' }}>
              <span>{selectedLang?.label}</span>
              <span style={{ color: '#7070a0' }}>▾</span>
            </button>
            {showLangPicker && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: '#1a1a2b', border: '1px solid #2a2a3a', borderRadius: 12, overflow: 'hidden', zIndex: 50, boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                {LANGUAGES.map((l, i) => (
                  <button key={l.code} onClick={() => switchLang(l.code)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '12px 16px', fontSize: 13,
                      borderBottom: i < LANGUAGES.length-1 ? '1px solid #252535' : 'none',
                      background: lang===l.code ? 'rgba(245,158,11,0.1)' : 'transparent',
                      color: lang===l.code ? '#f59e0b' : '#d0d0e0',
                      fontWeight: lang===l.code ? 600 : 400, cursor: 'pointer', border: 'none',
                    }}>
                    {l.label}
                    {lang===l.code && ' ✓'}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Interim preview */}
        {interim && (
          <div style={{ background: '#1e1e28', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, padding: '8px 12px', marginBottom: 8, fontSize: 13, color: '#9090b0', fontStyle: 'italic' }}>
            {interim}...
          </div>
        )}

        <textarea
          value={comments} onChange={e => setComments(e.target.value)}
          placeholder={listening ? 'Listening... speak now' : 'Type here or tap Speak for voice input'}
          rows={4}
          style={{
            width: '100%', background: '#111118', borderRadius: 12, padding: '12px 16px',
            fontSize: 13, outline: 'none', resize: 'none', fontFamily: 'inherit', color: '#f0f0f5',
            border: listening ? '1px solid rgba(239,68,68,0.5)' : '1px solid #1e1e28',
            boxSizing: 'border-box',
          }}
        />
        {listening && <p style={{ fontSize: 11, color: '#ef4444', textAlign: 'center', marginTop: 4 }}>🔴 Recording — tap Stop when done</p>}
      </div>

      {/* Point of Contact */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-[#7070a0] uppercase tracking-wider mb-2 block">Point of Contact</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input value={poc.name} onChange={e => setPoc(p => ({...p, name: e.target.value}))} placeholder="Contact person name" className={inp} />
          <input value={poc.mobile} onChange={e => setPoc(p => ({...p, mobile: e.target.value}))} placeholder="Contact mobile" type="tel" inputMode="numeric" className={inp} />
        </div>
      </div>

      {/* Demo toggle */}
      <div className="mb-4">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#111118', border: '1px solid #1e1e28', borderRadius: 12, padding: '12px 16px' }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600 }}>Demo Given?</p>
            <p style={{ fontSize: 11, color: '#7070a0' }}>Showed AI try-on?</p>
          </div>
          <button onClick={() => setDemoGiven(d => !d)}
            style={{ width: 48, height: 24, borderRadius: 12, background: demoGiven ? '#f59e0b' : '#2a2a3a', border: 'none', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}>
            <div style={{ width: 20, height: 20, background: '#fff', borderRadius: '50%', position: 'absolute', top: 2, left: demoGiven ? 26 : 2, transition: 'left 0.2s' }} />
          </button>
        </div>
        {demoGiven && (
          <input value={demoMobile} onChange={e => setDemoMobile(e.target.value)}
            placeholder="Customer mobile for demo login" type="tel" inputMode="numeric"
            className={inp} style={{ marginTop: 8 }} />
        )}
      </div>

      {/* Follow-up date */}
      <div className="mb-6">
        <label className="text-xs font-semibold text-[#7070a0] uppercase tracking-wider mb-2 block">Next Follow-up Date <span className="text-red-400">*</span></label>
        <input type="date" value={followUp} onChange={e => setFollowUp(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className={inp} style={{ color: '#f0f0f5' }} />
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '12px 16px', color: '#f87171', fontSize: 13, marginBottom: 16 }}>
          ⚠️ {error}
        </div>
      )}

      <button onClick={submit} disabled={submitting}
        style={{
          width: '100%', background: submitting ? '#b45309' : '#f59e0b', color: '#000',
          fontWeight: 700, padding: '16px', borderRadius: 12, fontSize: 15, border: 'none',
          cursor: submitting ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: submitting ? 0.7 : 1,
        }}>
        {submitting ? <><Spinner size="sm" /> Saving visit...</> : '✓ Save Visit'}
      </button>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  )
}