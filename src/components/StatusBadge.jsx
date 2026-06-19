const cfg = {
  "New":            "bg-[#252530] text-[#9090b0]",
  "Interested":     "bg-green-500/10 text-green-400",
  "Not Interested": "bg-red-500/10 text-red-400",
  "Follow Up":      "bg-blue-500/10 text-blue-400",
  "Demo Given":     "bg-purple-500/10 text-purple-400",
  "Onboarded":      "bg-amber-500/10 text-amber-400",
  "Tier A":         "bg-amber-500/15 text-amber-400",
  "Tier B":         "bg-sky-500/15 text-sky-400",
  "Tier C":         "bg-[#252530] text-[#9090b0]",
  "YES":            "bg-green-500/10 text-green-400",
  "NO":             "bg-red-500/10 text-red-400",
  "MAYBE":          "bg-orange-500/10 text-orange-400",
}
export default function StatusBadge({ value, size = "sm" }) {
  const cls = cfg[value] || "bg-[#252530] text-[#9090b0]"
  const sz  = size === "xs" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-0.5"
  return <span className={`inline-block rounded-md font-semibold ${cls} ${sz}`}>{value}</span>
}