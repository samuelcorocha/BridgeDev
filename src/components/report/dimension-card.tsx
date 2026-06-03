import { CheckCircle, AlertCircle } from "lucide-react"

interface Props {
  label: string
  score: number
  points: string[]
  improvements: string[]
}

export function DimensionCard({ label, score, points, improvements }: Props) {
  const color =
    score >= 80
      ? "text-green-600"
      : score >= 60
        ? "text-yellow-600"
        : "text-red-600"

  return (
    <div className="border border-zinc-200 rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-sm">{label}</h3>
        <span className={`font-bold text-lg ${color}`}>{score.toFixed(0)}</span>
      </div>

      {points.length > 0 && (
        <ul className="space-y-1">
          {points.map((p, i) => (
            <li key={i} className="flex gap-2 text-xs text-green-700">
              <CheckCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              {p}
            </li>
          ))}
        </ul>
      )}

      {improvements.length > 0 && (
        <ul className="space-y-1">
          {improvements.map((p, i) => (
            <li key={i} className="flex gap-2 text-xs text-yellow-700">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              {p}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
