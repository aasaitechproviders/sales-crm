import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../api'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/Spinner'
import StatusBadge from '../../components/StatusBadge'

export default function AgentLeadDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [assigning, setAssigning] = useState(false)
  const [error, setError]       = useState('')

  const load = () => {
    setLoading(true)
    api.getLead(id)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  const selfAssign = async () => {
    setAssigning(true)
    try { await api.assignLead(id); load() }
    catch(e) { alert(e.message) }
    finally { setAssigning(false) }
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div>
  if (error)   return <div className="p-4"><div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">{error}</div></div>
  if (!data)   return <div className="p-4 text-[#7070a0]">Lead not found</div>

  const { lead, visits } = data
  const myId       = user?._id
  const isMyLead   = lead.assignedToInfo?._id === myId
  const isUnassigned = !lead.assignedTo

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-[#1e1e28]">
        <button onClick={() => navigate(-1)} className="text-[#7070a0] text-sm mb-2 flex items-center gap-1">← Back</button>
        <h1 className="font-bold text-base leading-tight">{lead.businessName}</h1>
        <p className="text-xs text-[#7070a0] mt-0.5">{lead.subCategory} · {lead.town}</p>
        <div className="flex gap-2 mt-2 flex-wrap">
          <StatusBadge value={lead.status} />
          <StatusBadge value={lead.priorityTier} />
          {lead.canUseAITryOn && <StatusBadge value={lead.canUseAITryOn} />}
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 flex gap-2">
        {isUnassigned && (
          <button onClick={selfAssign} disabled={assigning}
            className="flex-1 bg-amber-500 text-black font-bold py-3 rounded-xl text-sm active:bg-amber-600 flex items-center justify-center gap-2 disabled:opacity-50">
            {assigning ? <Spinner size="sm" /> : '🎯 Assign to Me'}
          </button>
        )}
        {isMyLead && (
          <button onClick={() => navigate(`/leads/${id}/visit`)}
            className="flex-1 bg-amber-500 text-black font-bold py-3 rounded-xl text-sm active:bg-amber-600">
            📸 Log Visit
          </button>
        )}
        {!isUnassigned && !isMyLead && (
          <div className="flex-1 bg-[#111118] border border-[#1e1e28] text-[#7070a0] py-3 rounded-xl text-sm text-center">
            Assigned to {lead.assignedToInfo?.name || 'another agent'}
          </div>
        )}
        {lead.phone && (
          <a href={`tel:${lead.phone}`} className="bg-[#111118] border border-[#1e1e28] px-4 py-3 rounded-xl text-lg">📞</a>
        )}
        {lead.whatsapp && (
          <a href={`https://wa.me/${(lead.whatsapp||'').replace(/\s/g,'')}`} target="_blank"
            className="bg-[#111118] border border-[#1e1e28] px-4 py-3 rounded-xl text-lg">💬</a>
        )}
      </div>

      {/* Info */}
      <div className="px-4 space-y-2 mb-4">
        {[
          ['Address',    lead.address],
          ['Phone',      lead.phone],
          ['Size',       lead.businessSize],
          ['AI Score',   lead.aiScore ? `${lead.aiScore}/10` : null],
          ['Rating',     lead.googleRating ? `⭐ ${lead.googleRating} (${lead.reviewCount} reviews)` : null],
          ['Segment',    lead.targetSegment],
          ['Assigned',   lead.assignedToInfo ? lead.assignedToInfo.name : 'Unassigned'],
        ].map(([l, v]) => v ? (
          <div key={l} className="bg-[#111118] border border-[#1e1e28] rounded-xl px-4 py-3">
            <p className="text-[10px] font-semibold text-[#7070a0] uppercase tracking-wider mb-0.5">{l}</p>
            <p className="text-sm">{v}</p>
          </div>
        ) : null)}

        {/* Links */}
        <div className="flex gap-2 flex-wrap pt-1">
          {lead.googleMapsURL && <a href={lead.googleMapsURL} target="_blank" className="bg-[#111118] border border-[#1e1e28] rounded-lg px-3 py-2 text-xs text-[#7070a0]">📍 Maps</a>}
          {lead.instagram && <a href={lead.instagram} target="_blank" className="bg-[#111118] border border-[#1e1e28] rounded-lg px-3 py-2 text-xs text-[#7070a0]">📸 Instagram</a>}
          {lead.facebook && <a href={lead.facebook} target="_blank" className="bg-[#111118] border border-[#1e1e28] rounded-lg px-3 py-2 text-xs text-[#7070a0]">📘 Facebook</a>}
        </div>
      </div>

      {/* Visit History */}
      <div className="px-4">
        <p className="text-xs font-semibold text-[#7070a0] uppercase tracking-wider mb-3">
          Visit History ({visits?.length || 0})
        </p>
        {!visits?.length
          ? <div className="bg-[#111118] border border-[#1e1e28] rounded-xl p-6 text-center">
              <p className="text-3xl mb-2">📋</p>
              <p className="text-[#7070a0] text-sm">No visits yet</p>
              {(isMyLead || isUnassigned) && (
                <button onClick={() => navigate(`/leads/${id}/visit`)}
                  className="mt-3 bg-amber-500/10 text-amber-500 text-sm font-semibold px-4 py-2 rounded-lg">
                  Log First Visit →
                </button>
              )}
            </div>
          : <div className="space-y-3">
              {visits.map(v => (
                <div key={v._id} className="bg-[#111118] border border-[#1e1e28] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <StatusBadge value={v.outcome} />
                    <span className="text-xs text-[#7070a0]">{fmtDate(v.createdAt)}</span>
                  </div>
                  <p className="text-sm text-[#d0d0e0] mb-2 leading-relaxed">{v.comments}</p>
                  {v.pointOfContact?.name && (
                    <p className="text-xs text-[#7070a0]">👤 {v.pointOfContact.name}
                      {v.pointOfContact.mobile && ` · ${v.pointOfContact.mobile}`}
                    </p>
                  )}
                  {v.demoGiven && (
                    <p className="text-xs text-purple-400 mt-1">
                      ✓ Demo given{v.demoLoginMobile ? ` · Login: ${v.demoLoginMobile}` : ''}
                    </p>
                  )}
                  {v.nextFollowUpDate && (
                    <p className="text-xs text-amber-400 mt-1">📅 Follow-up: {fmtDate(v.nextFollowUpDate)}</p>
                  )}
                  {v.photoUrl && (
                    <img src={v.photoUrl} alt="visit" className="w-full rounded-lg mt-3 object-cover max-h-48" />
                  )}
                  {v.gps && (
                    <p className="text-[10px] text-[#505070] mt-1">📍 {v.gps.lat?.toFixed(4)}, {v.gps.lng?.toFixed(4)}</p>
                  )}
                </div>
              ))}
            </div>
        }
      </div>
    </div>
  )
}

function fmtDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })
}