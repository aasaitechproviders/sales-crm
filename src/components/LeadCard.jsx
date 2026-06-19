import { useNavigate } from 'react-router-dom'
import StatusBadge from './StatusBadge'

export default function LeadCard({ lead, href, onAssign, showAssign }) {
  const navigate = useNavigate()
  return (
    <div
      onClick={() => navigate(href)}
      className="bg-[#111118] border border-[#1e1e28] rounded-xl p-4 active:bg-[#18181f] transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-tight truncate">{lead.businessName}</p>
          <p className="text-xs text-[#7070a0] mt-0.5">{lead.subCategory} · {lead.town}</p>
        </div>
        <StatusBadge value={lead.priorityTier} size="xs" />
      </div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        <StatusBadge value={lead.status} size="xs" />
        {lead.canUseAITryOn && <StatusBadge value={lead.canUseAITryOn} size="xs" />}
        {lead.businessSize && <span className="text-[10px] bg-[#1e1e28] text-[#7070a0] px-1.5 py-0.5 rounded-md">{lead.businessSize}</span>}
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#7070a0]">{lead.phone || 'No phone'}</p>
        {lead.assignedToInfo
          ? <span className="text-[10px] text-[#7070a0]">👤 {lead.assignedToInfo.name}</span>
          : showAssign
            ? <button onClick={e => { e.stopPropagation(); onAssign && onAssign(lead) }}
                className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-1 rounded-md font-semibold active:bg-amber-500/20">
                Assign to Me
              </button>
            : <span className="text-[10px] text-[#7070a0]">Unassigned</span>
        }
      </div>
    </div>
  )
}