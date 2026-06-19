import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/Spinner'
import StatusBadge from '../../components/StatusBadge'

export default function AgentDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  useEffect(() => {
    api.todayFollowups()
      .then(d => setData(d))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const today = new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'short' })

  if (loading) return <div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div>

  return (
    <div className="px-4 py-4">
      <div className="mb-5">
        <p className="text-xs text-[#7070a0]">{today}</p>
        <h1 className="text-xl font-bold mt-0.5">Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
      </div>

      {/* Today stats */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-[#7070a0]">Today's Follow-ups</p>
          <p className="text-3xl font-bold text-amber-500">{data?.count || 0}</p>
        </div>
        <div className="text-4xl">📅</div>
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {/* Follow-up list */}
      {!data?.followups?.length
        ? <div className="text-center py-12">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-[#7070a0]">No follow-ups today</p>
            <button onClick={() => navigate('/leads')} className="mt-4 text-amber-500 text-sm font-semibold">Browse Leads →</button>
          </div>
        : <div className="space-y-3">
            <p className="text-xs font-semibold text-[#7070a0] uppercase tracking-wider">Due Today</p>
            {data.followups.map(({ visit, lead }) => lead && (
              <div key={visit._id}
                onClick={() => navigate(`/leads/${lead._id}`)}
                className="bg-[#111118] border border-[#1e1e28] rounded-xl p-4 active:bg-[#18181f] cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-semibold text-sm leading-tight">{lead.businessName}</p>
                  <StatusBadge value={lead.status} size="xs" />
                </div>
                <p className="text-xs text-[#7070a0] mb-2">{lead.subCategory} · {lead.town}</p>
                {visit.comments && <p className="text-xs text-[#9090b0] bg-[#1e1e28] rounded-lg px-3 py-2 line-clamp-2">💬 {visit.comments}</p>}
                {visit.pointOfContact?.name && (
                  <p className="text-xs text-[#7070a0] mt-2">👤 {visit.pointOfContact.name} {visit.pointOfContact.mobile && `· ${visit.pointOfContact.mobile}`}</p>
                )}
                <div className="mt-3">
                  <button
                    onClick={e => { e.stopPropagation(); navigate(`/leads/${lead._id}/visit`) }}
                    className="w-full bg-amber-500/10 text-amber-500 font-semibold text-sm py-2 rounded-lg active:bg-amber-500/20"
                  >
                    Log Visit →
                  </button>
                </div>
              </div>
            ))}
          </div>
      }
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}