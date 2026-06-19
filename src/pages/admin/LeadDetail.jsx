import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../api'
import Spinner from '../../components/Spinner'
import StatusBadge from '../../components/StatusBadge'

const STATUSES = ['New','Interested','Not Interested','Follow Up','Demo Given','Onboarded']

export default function AdminLeadDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData]           = useState(null)
  const [agents, setAgents]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [assigning, setAssigning] = useState(false)
  const [selAgent, setSelAgent]   = useState('')
  const [statusLoading, setStatusLoading] = useState('')
  const [error, setError]         = useState('')
  const [toast, setToast]         = useState('')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  const load = () => {
    Promise.all([api.getLead(id), api.getAgents()])
      .then(([d, a]) => { setData(d); setAgents(a.agents || []) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [id])

  const assignTo = async () => {
    if (!selAgent) return
    setAssigning(true)
    try { await api.assignLead(id, { agentId: selAgent }); showToast('Lead assigned ✓'); load() }
    catch(e) { alert(e.message) }
    finally { setAssigning(false) }
  }

  const updateStatus = async (status) => {
    setStatusLoading(status)
    try { await api.updateLead(id, { status }); showToast(`Status → ${status} ✓`); load() }
    catch(e) { alert(e.message) }
    finally { setStatusLoading('') }
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div>
  if (error)   return <div className="p-4 text-red-400 text-sm">{error}</div>
  if (!data)   return <div className="p-4 text-[#7070a0]">Lead not found</div>

  const { lead, visits } = data

  return (
    <div className="pb-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-black text-sm font-bold px-4 py-2 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-[#1e1e28]">
        <button onClick={() => navigate(-1)} className="text-[#7070a0] text-sm mb-2">← Back</button>
        <h1 className="font-bold text-base leading-tight">{lead.businessName}</h1>
        <p className="text-xs text-[#7070a0] mt-0.5">{lead.subCategory} · {lead.town}, {lead.district}</p>
        <div className="flex gap-2 mt-2 flex-wrap">
          <StatusBadge value={lead.status} />
          <StatusBadge value={lead.priorityTier} />
          {lead.canUseAITryOn && <StatusBadge value={lead.canUseAITryOn} />}
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Assign */}
        <div className="bg-[#111118] border border-[#1e1e28] rounded-xl p-4">
          <p className="text-xs font-semibold text-[#7070a0] uppercase tracking-wider mb-2">Assignment</p>
          <p className="text-sm mb-3 font-medium">
            {lead.assignedToInfo ? `👤 ${lead.assignedToInfo.name}` : '⚠️ Unassigned'}
          </p>
          <div className="flex gap-2">
            <select value={selAgent} onChange={e => setSelAgent(e.target.value)}
              className="flex-1 bg-[#1e1e28] border border-[#2a2a3a] rounded-lg px-3 py-2.5 text-sm outline-none">
              <option value="">Select agent</option>
              {agents.map(a => <option key={a._id} value={a._id}>{a.name} — {a.mobile}</option>)}
            </select>
            <button onClick={assignTo} disabled={assigning || !selAgent}
              className="bg-amber-500 text-black font-bold px-4 rounded-lg text-sm disabled:opacity-50 flex items-center gap-1 min-w-[70px] justify-center">
              {assigning ? <Spinner size="sm" /> : 'Assign'}
            </button>
          </div>
        </div>

        {/* Status */}
        <div className="bg-[#111118] border border-[#1e1e28] rounded-xl p-4">
          <p className="text-xs font-semibold text-[#7070a0] uppercase tracking-wider mb-3">Update Status</p>
          <div className="grid grid-cols-2 gap-2">
            {STATUSES.map(s => (
              <button key={s} onClick={() => updateStatus(s)}
                disabled={!!statusLoading}
                className={`py-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1
                  ${lead.status === s
                    ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                    : 'bg-[#1e1e28] border-transparent text-[#9090b0] active:bg-[#252530]'}
                  ${statusLoading === s ? 'opacity-50' : ''}
                `}>
                {statusLoading === s ? <Spinner size="sm" /> : null}
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="bg-[#111118] border border-[#1e1e28] rounded-xl p-4">
          <p className="text-xs font-semibold text-[#7070a0] uppercase tracking-wider mb-3">Business Info</p>
          <div className="space-y-2">
            {[
              ['Phone',   lead.phone],
              ['WhatsApp', lead.whatsapp],
              ['Address', lead.address],
              ['Size',    lead.businessSize],
              ['AI Score', lead.aiScore ? `${lead.aiScore}/10` : null],
              ['Rating',  lead.googleRating ? `⭐ ${lead.googleRating} (${lead.reviewCount})` : null],
              ['Source',  lead.source],
            ].map(([l,v]) => v ? (
              <div key={l} className="flex justify-between">
                <span className="text-xs text-[#7070a0]">{l}</span>
                <span className="text-xs font-medium text-right max-w-[60%]">{v}</span>
              </div>
            ) : null)}
          </div>
        </div>

        {/* Links */}
        <div className="flex gap-2 flex-wrap">
          {lead.googleMapsURL && <a href={lead.googleMapsURL} target="_blank" className="bg-[#111118] border border-[#1e1e28] rounded-lg px-3 py-2 text-xs text-[#7070a0]">📍 Maps</a>}
          {lead.instagram && <a href={lead.instagram} target="_blank" className="bg-[#111118] border border-[#1e1e28] rounded-lg px-3 py-2 text-xs text-[#7070a0]">📸 Instagram</a>}
          {lead.facebook && <a href={lead.facebook} target="_blank" className="bg-[#111118] border border-[#1e1e28] rounded-lg px-3 py-2 text-xs text-[#7070a0]">📘 Facebook</a>}
          {lead.phone && <a href={`tel:${lead.phone}`} className="bg-[#111118] border border-[#1e1e28] rounded-lg px-3 py-2 text-xs text-[#7070a0]">📞 Call</a>}
        </div>

        {/* Visits */}
        <div>
          <p className="text-xs font-semibold text-[#7070a0] uppercase tracking-wider mb-3">
            Visit History ({visits?.length || 0})
          </p>
          {!visits?.length
            ? <div className="bg-[#111118] border border-[#1e1e28] rounded-xl p-4 text-center text-[#7070a0] text-sm">No visits yet</div>
            : <div className="space-y-3">
                {visits.map(v => (
                  <div key={v._id} className="bg-[#111118] border border-[#1e1e28] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <StatusBadge value={v.outcome} />
                      <span className="text-xs text-[#7070a0]">{new Date(v.createdAt).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'2-digit'})}</span>
                    </div>
                    {v.agentInfo && <p className="text-xs text-amber-500 mb-1">👤 {v.agentInfo.name}</p>}
                    <p className="text-sm text-[#d0d0e0] mb-2 leading-relaxed">{v.comments}</p>
                    {v.pointOfContact?.name && <p className="text-xs text-[#7070a0]">Contact: {v.pointOfContact.name} · {v.pointOfContact.mobile}</p>}
                    {v.demoGiven && <p className="text-xs text-purple-400 mt-1">✓ Demo{v.demoLoginMobile ? ` · ${v.demoLoginMobile}` : ''}</p>}
                    {v.nextFollowUpDate && <p className="text-xs text-amber-400 mt-1">📅 {new Date(v.nextFollowUpDate).toLocaleDateString('en-IN')}</p>}
                    {v.photoUrl && <img src={v.photoUrl} alt="visit" className="w-full rounded-lg mt-3 max-h-48 object-cover" />}
                    {v.gps && <p className="text-[10px] text-[#505070] mt-1">📍 {v.gps.lat?.toFixed(4)}, {v.gps.lng?.toFixed(4)}</p>}
                  </div>
                ))}
              </div>
          }
        </div>
      </div>
    </div>
  )
}