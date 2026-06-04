interface Props {
  score: number
}

export function ScoreGauge({ score }: Props) {
  const radius = 50
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  const color =
    score >= 70 ? "#16a34a" : score >= 50 ? "#ca8a04" : "#dc2626"

  return (
    <svg width="120" height="120" viewBox="0 0 120 120" aria-label={`Score: ${score}`}>
      <circle
        cx="60"
        cy="60"
        r={radius}
        fill="none"
        stroke="currentColor"
        className="text-zinc-200 dark:text-zinc-700"
        strokeWidth="10"
      />
      <circle
        cx="60"
        cy="60"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeDasharray={`${progress} ${circumference}`}
        strokeLinecap="round"
        transform="rotate(-90 60 60)"
      />
    </svg>
  )
}
