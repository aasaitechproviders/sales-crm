import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../../api'
import Spinner from '../../components/Spinner'
import LeadCard from '../../components/LeadCard'

const TOWNS    = ['Kallakurichi','Tirukoilur','Ulundurpet','Chinnasalem','Sankarapuram','Manalurpet','Thiyagadurgam','Mungilthuraipattu','Vanapuram','Rishivandiyam','Vadakkanandal','Kachirayapalayam']
const TIERS    = ['Tier A','Tier B','Tier C']
const STATUSES = ['New','Interested','Not Interested','Follow Up','Demo Given','Onboarded']
const CATS     = ['Fashion & Apparel','Beauty & Bridal','Jewellery','Footwear','Fashion Support']

export default function AdminLeads() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [leads, setLeads]     = useState([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [filters, setFilters] = useState({ assignedTo: searchParams.get('assignedTo') || '' })
  const [showFilter, setShowFilter] = useState(false)

  const load = useCallback(async (p = 1, reset = false) => {
    setLoading(true)
    try {
      const params = { page: p, limit: 20 }
      if (search) params.search = search
      Object.entries(filters).forEach(([k,v]) => { if (v) params[k] = v })
      const d = await api.getLeads(params)
      setLeads(prev => reset ? d.leads : [...prev, ...d.leads])
      setTotal(d.total)
      setPage(p)
    } catch(e) {} finally { setLoading(false) }
  }, [filters, search])

  useEffect(() => { load(1, true) }, [load])

  const chip = (label, active, onClick) => (
    <button onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors whitespace-nowrap ${active ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'border-[#1e1e28] text-[#7070a0]'}`}>
      {label}
    </button>
  )
  const setF = (k, v) => setFilters(f => ({...f, [k]: f[k]===v ? '' : v}))

  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <h1 className="font-bold text-lg">All Leads</h1>
        <button onClick={() => navigate('/admin/leads/new')}
          className="bg-amber-500 text-black font-bold px-4 py-2 rounded-xl text-sm">+ New</button>
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-3">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7070a0]">🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search leads..."
            className="w-full bg-[#111118] border border-[#1e1e28] rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-amber-500" />
        </div>
        <button onClick={() => setShowFilter(f => !f)}
          className={`px-3 rounded-xl border text-sm ${showFilter ? 'border-amber-500 text-amber-500 bg-amber-500/10' : 'border-[#1e1e28] text-[#7070a0]'}`}>
          ⚙️
        </button>
      </div>

      {/* Filters */}
      {showFilter && (
        <div className="bg-[#111118] border border-[#1e1e28] rounded-xl p-4 mb-3 space-y-3">
          <div>
            <p className="text-xs text-[#7070a0] mb-2">ASSIGNMENT</p>
            <div className="flex gap-2 flex-wrap">
              {chip('Unassigned', filters.assignedTo==='unassigned', () => setF('assignedTo','unassigned'))}
              {chip('Assigned', filters.assignedTo==='assigned', () => setF('assignedTo','assigned'))}
            </div>
          </div>
          <div>
            <p className="text-xs text-[#7070a0] mb-2">TIER</p>
            <div className="flex gap-2 flex-wrap">
              {TIERS.map(t => chip(t, filters.tier===t, () => setF('tier',t)))}
            </div>
          </div>
          <div>
            <p className="text-xs text-[#7070a0] mb-2">STATUS</p>
            <div className="flex gap-2 flex-wrap">
              {STATUSES.map(s => chip(s, filters.status===s, () => setF('status',s)))}
            </div>
          </div>
          <div>
            <p className="text-xs text-[#7070a0] mb-2">TOWN</p>
            <div className="flex gap-2 flex-wrap">
              {TOWNS.map(t => chip(t, filters.town===t, () => setF('town',t)))}
            </div>
          </div>
          <div>
            <p className="text-xs text-[#7070a0] mb-2">CATEGORY</p>
            <div className="flex gap-2 flex-wrap">
              {CATS.map(c => chip(c, filters.category===c, () => setF('category',c)))}
            </div>
          </div>
          <button onClick={() => setFilters({})} className="text-xs text-red-400">✕ Clear all</button>
        </div>
      )}

      <p className="text-xs text-[#7070a0] mb-3">{total} leads</p>

      {loading && page === 1
        ? <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        : <div className="space-y-3">
            {leads.map(lead => (
              <LeadCard key={lead._id} lead={lead} href={`/admin/leads/${lead._id}`} />
            ))}
            {leads.length < total && (
              <button onClick={() => load(page+1)}
                className="w-full py-3 text-amber-500 text-sm font-semibold bg-[#111118] border border-[#1e1e28] rounded-xl">
                {loading ? <Spinner size="sm" /> : 'Load more'}
              </button>
            )}
            {!leads.length && !loading && (
              <div className="text-center py-12 text-[#7070a0]"><p className="text-4xl mb-3">🔍</p><p>No leads found</p></div>
            )}
          </div>
      }
    </div>
  )
}