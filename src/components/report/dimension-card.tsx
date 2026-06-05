import { CheckCircle, AlertCircle } from "lucide-react"

interface Props {
  label: string
  score: number
  points: string[]
  improvements: string[]
}

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400"
  if (score >= 60) return "text-amber-600 dark:text-amber-400"
  return "text-red-600 dark:text-red-400"
}

function barColor(score: number) {
  if (score >= 80) return "bg-emerald-500"
  if (score >= 60) return "bg-amber-500"
  return "bg-red-500"
}

export function DimensionCard({ label, score, points, improvements }: Props) {
  return (
    <div className="bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800 rounded-xl p-4 space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-sm">{label}</h3>
        <span className={`font-bold text-lg ${scoreColor(score)}`}>{score.toFixed(0)}</span>
      </div>

      <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>

      {points.length > 0 && (
        <ul className="space-y-1">
          {points.map((p, i) => (
            <li key={i} className="flex gap-2 text-xs text-emerald-700 dark:text-emerald-400">
              <CheckCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              {p}
            </li>
          ))}
        </ul>
      )}

      {improvements.length > 0 && (
        <ul className="space-y-1">
          {improvements.map((p, i) => (
            <li key={i} className="flex gap-2 text-xs text-amber-700 dark:text-amber-400">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              {p}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
