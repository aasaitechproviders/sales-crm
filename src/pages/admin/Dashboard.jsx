import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api'
import Spinner from '../../components/Spinner'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [data, setData]       = useState(null)
  const [followups, setFollowups] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState('overview')

  useEffect(() => {
    Promise.all([api.adminDashboard(), api.adminFollowups()])
      .then(([d, f]) => { setData(d); setFollowups(f) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div>

  const { summary, pipeline, tierBreakdown, townBreakdown, agents } = data || {}

  return (
    <div className="px-4 py-4">
      <h1 className="font-bold text-lg mb-4">Admin Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <StatCard label="Total Leads" value={summary?.totalLeads} icon="📋" color="amber" />
        <StatCard label="Unassigned" value={summary?.unassignedLeads} icon="📭" color="red" onClick={() => navigate('/admin/leads?assignedTo=unassigned')} />
        <StatCard label="Onboarded" value={summary?.onboardedLeads} icon="✅" color="green" />
        <StatCard label="Agents" value={summary?.totalAgents} icon="👥" color="blue" onClick={() => navigate('/admin/agents')} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {['overview','agents','followups','towns'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors ${tab===t ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'border-[#1e1e28] text-[#7070a0]'}`}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-4">
          <SectionTitle>Pipeline</SectionTitle>
          {pipeline?.map(p => (
            <div key={p._id} className="flex items-center gap-3">
              <span className="text-xs text-[#7070a0] w-28">{p._id}</span>
              <div className="flex-1 bg-[#1e1e28] rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{width:`${(p.count/summary.totalLeads)*100}%`}} />
              </div>
              <span className="text-xs font-bold text-amber-500 w-8 text-right">{p.count}</span>
            </div>
          ))}
          <SectionTitle className="mt-4">Tier Breakdown</SectionTitle>
          {tierBreakdown?.map(t => (
            <div key={t._id} className="flex items-center justify-between bg-[#111118] border border-[#1e1e28] rounded-xl px-4 py-3">
              <span className="text-sm">{t._id}</span>
              <span className="font-bold text-amber-500">{t.count}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'agents' && (
        <div className="space-y-3">
          {!agents?.length
            ? <div className="text-center py-8 text-[#7070a0]">
                <p className="text-3xl mb-2">👥</p>
                <p>No agents yet</p>
                <button onClick={() => navigate('/admin/agents')} className="mt-3 text-amber-500 text-sm font-semibold">Create Agent →</button>
              </div>
            : agents.map(a => (
              <div key={a.agent._id} className="bg-[#111118] border border-[#1e1e28] rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-sm">{a.agent.name}</p>
                    <p className="text-xs text-[#7070a0]">{a.agent.mobile}</p>
                  </div>
                  <span className="text-xs bg-amber-500/10 text-amber-500 px-2 py-1 rounded-full font-semibold">
                    📅 {a.todayFollowups} today
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <MiniStat label="Assigned" value={a.assignedLeads} />
                  <MiniStat label="Visits" value={a.totalVisits} />
                  <MiniStat label="Today" value={a.todayFollowups} />
                </div>
                {a.statusBreakdown?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {a.statusBreakdown.map(s => (
                      <span key={s._id} className="text-[10px] bg-[#1e1e28] text-[#9090b0] px-2 py-0.5 rounded-md">{s._id}: {s.count}</span>
                    ))}
                  </div>
                )}
              </div>
            ))
          }
        </div>
      )}

      {tab === 'followups' && (
        <div className="space-y-3">
          <p className="text-xs text-[#7070a0]">{followups?.count || 0} follow-ups today</p>
          {!followups?.followups?.length
            ? <div className="text-center py-8 text-[#7070a0]"><p className="text-3xl mb-2">✅</p><p>No follow-ups today</p></div>
            : followups.followups.map(({ visit, lead, agent }) => lead && (
              <div key={visit._id} onClick={() => navigate(`/admin/leads/${lead._id}`)}
                className="bg-[#111118] border border-[#1e1e28] rounded-xl p-4 cursor-pointer active:bg-[#18181f]">
                <div className="flex items-start justify-between mb-1">
                  <p className="font-semibold text-sm">{lead.businessName}</p>
                  <span className="text-[10px] text-[#7070a0]">{lead.town}</span>
                </div>
                {agent && <p className="text-xs text-amber-500 mb-1">👤 {agent.name}</p>}
                <p className="text-xs text-[#7070a0] line-clamp-2">{visit.comments}</p>
              </div>
            ))
          }
        </div>
      )}

      {tab === 'towns' && (
        <div className="space-y-2">
          {townBreakdown?.map(t => (
            <div key={t._id} className="flex items-center gap-3">
              <span className="text-xs text-[#7070a0] w-36 truncate">{t._id}</span>
              <div className="flex-1 bg-[#1e1e28] rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{width:`${(t.count/summary.totalLeads)*100}%`}} />
              </div>
              <span className="text-xs font-bold w-8 text-right">{t.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const StatCard = ({ label, value, icon, color, onClick }) => {
  const colors = { amber:'bg-amber-500/10 border-amber-500/20 text-amber-500', red:'bg-red-500/10 border-red-500/20 text-red-400', green:'bg-green-500/10 border-green-500/20 text-green-400', blue:'bg-blue-500/10 border-blue-500/20 text-blue-400' }
  return (
    <div onClick={onClick} className={`${colors[color]} border rounded-xl p-4 ${onClick ? 'cursor-pointer active:opacity-80' : ''}`}>
      <p className="text-2xl mb-1">{icon}</p>
      <p className="text-2xl font-bold">{value ?? '—'}</p>
      <p className="text-xs opacity-70 mt-0.5">{label}</p>
    </div>
  )
}

const MiniStat = ({ label, value }) => (
  <div className="bg-[#1e1e28] rounded-lg px-3 py-2 text-center">
    <p className="text-sm font-bold">{value}</p>
    <p className="text-[10px] text-[#7070a0]">{label}</p>
  </div>
)

const SectionTitle = ({ children }) => (
  <p className="text-xs font-semibold text-[#7070a0] uppercase tracking-wider mb-2">{children}</p>
)