export default function Spinner({ size = "md" }) {
  const s = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-10 h-10" : "w-7 h-7"
  return <div className={`${s} border-2 border-amber-500 border-t-transparent rounded-full animate-spin`} />
}