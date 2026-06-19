import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api'
import Spinner from '../../components/Spinner'
import LeadCard from '../../components/LeadCard'

const TOWNS = ['Kallakurichi','Tirukoilur','Ulundurpet','Chinnasalem','Sankarapuram','Manalurpet','Thiyagadurgam','Mungilthuraipattu','Vanapuram','Rishivandiyam','Vadakkanandal','Kachirayapalayam']
const TIERS = ['Tier A','Tier B','Tier C']
const STATUSES = ['New','Interested','Not Interested','Follow Up','Demo Given','Onboarded']

export default function AgentLeads() {
  const navigate = useNavigate()
  const [leads, setLeads]     = useState([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [filters, setFilters] = useState({})
  const [showFilter, setShowFilter] = useState(false)
  const [view, setView]       = useState('all') // all | mine | unassigned

  const load = useCallback(async (p = 1, reset = false) => {
    setLoading(true)
    try {
      const params = { page: p, limit: 20, ...filters }
      if (search) params.search = search
      if (view === 'mine') params.assignedTo = 'me'
      if (view === 'unassigned') params.assignedTo = 'unassigned'
      const d = await api.getLeads(params)
      setLeads(prev => reset ? d.leads : [...prev, ...d.leads])
      setTotal(d.total)
      setPage(p)
    } catch(e) {} finally { setLoading(false) }
  }, [filters, search, view])

  useEffect(() => { load(1, true) }, [load])

  const selfAssign = async (lead) => {
    try {
      await api.assignLead(lead._id)
      load(1, true)
    } catch(e) { alert(e.message) }
  }

  const chip = (label, active, onClick) => (
    <button onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${active ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'border-[#1e1e28] text-[#7070a0]'}`}>
      {label}
    </button>
  )

  return (
    <div className="px-4 py-4">
      {/* Search */}
      <div className="flex gap-2 mb-3">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7070a0]">🔍</span>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search leads..."
            className="w-full bg-[#111118] border border-[#1e1e28] rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-amber-500"
          />
        </div>
        <button onClick={() => setShowFilter(f => !f)}
          className={`px-3 rounded-xl border text-sm transition-colors ${showFilter ? 'border-amber-500 text-amber-500 bg-amber-500/10' : 'border-[#1e1e28] text-[#7070a0]'}`}>
          ⚙️
        </button>
      </div>

      {/* View tabs */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1 no-scrollbar">
        {chip('All', view==='all', () => setView('all'))}
        {chip('Mine', view==='mine', () => setView('mine'))}
        {chip('Unassigned', view==='unassigned', () => setView('unassigned'))}
      </div>

      {/* Filters */}
      {showFilter && (
        <div className="bg-[#111118] border border-[#1e1e28] rounded-xl p-4 mb-3 space-y-3">
          <div>
            <p className="text-xs text-[#7070a0] mb-2">TIER</p>
            <div className="flex gap-2 flex-wrap">
              {TIERS.map(t => chip(t, filters.tier===t, () => setFilters(f => ({...f, tier: f.tier===t ? undefined : t}))))}
            </div>
          </div>
          <div>
            <p className="text-xs text-[#7070a0] mb-2">STATUS</p>
            <div className="flex gap-2 flex-wrap">
              {STATUSES.map(s => chip(s, filters.status===s, () => setFilters(f => ({...f, status: f.status===s ? undefined : s}))))}
            </div>
          </div>
          <div>
            <p className="text-xs text-[#7070a0] mb-2">TOWN</p>
            <div className="flex gap-2 flex-wrap">
              {TOWNS.map(t => chip(t, filters.town===t, () => setFilters(f => ({...f, town: f.town===t ? undefined : t}))))}
            </div>
          </div>
          <button onClick={() => setFilters({})} className="text-xs text-red-400">✕ Clear filters</button>
        </div>
      )}

      <p className="text-xs text-[#7070a0] mb-3">{total} leads</p>

      {loading && page === 1
        ? <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        : <div className="space-y-3">
            {leads.map(lead => (
              <LeadCard
                key={lead._id} lead={lead}
                href={`/leads/${lead._id}`}
                showAssign={!lead.assignedTo}
                onAssign={selfAssign}
              />
            ))}
            {leads.length < total && (
              <button onClick={() => load(page + 1)}
                className="w-full py-3 text-amber-500 text-sm font-semibold bg-[#111118] border border-[#1e1e28] rounded-xl">
                {loading ? <Spinner size="sm" /> : 'Load more'}
              </button>
            )}
            {!leads.length && !loading && (
              <div className="text-center py-12 text-[#7070a0]">
                <p className="text-4xl mb-3">🔍</p>
                <p>No leads found</p>
              </div>
            )}
          </div>
      }
    </div>
  )
}