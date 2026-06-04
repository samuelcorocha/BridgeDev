import { db } from "@/lib/db"
import { getRequiredSession } from "@/lib/session"
import { notFound } from "next/navigation"
import { StartChallengeButton } from "@/components/challenges/start-challenge-button"

const DIFFICULTY_LABELS = {
  BEGINNER: "Iniciante",
  INTERMEDIATE: "Intermediário",
  ADVANCED: "Avançado",
}

const DIFFICULTY_COLORS = {
  BEGINNER: "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-900",
  INTERMEDIATE: "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-900",
  ADVANCED: "bg-red-100 text-red-700 border border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-900",
}

const TECH_COLORS: Record<string, string> = {
  "Node.js": "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  "Express": "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  "Jest": "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400",
  "Vitest": "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
  "Git": "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
  "GitHub Actions": "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
  "Docker": "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  "Docker Compose": "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  "PostgreSQL": "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400",
  "YAML": "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  "TypeScript": "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  "React": "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400",
}

const DEFAULT_TECH = "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"

export default async function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const session = await getRequiredSession()
  const { slug } = await params

  const challenge = await db.challenge.findUnique({
    where: { slug, isActive: true },
  })
  if (!challenge) notFound()

  const existingSandbox = await db.sandbox.findUnique({
    where: {
      userId_challengeId: {
        userId: session.user.id,
        challengeId: challenge.id,
      },
    },
  })

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold">{challenge.title}</h1>
          <span className={`text-xs px-2 py-0.5 rounded font-medium ${DIFFICULTY_COLORS[challenge.difficulty]}`}>
            {DIFFICULTY_LABELS[challenge.difficulty]}
          </span>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {challenge.estimatedMinutes} minutos estimados
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {challenge.stack.map((s) => (
          <span
            key={s}
            className={`text-xs px-2 py-0.5 rounded font-medium ${TECH_COLORS[s] ?? DEFAULT_TECH}`}
          >
            {s}
          </span>
        ))}
      </div>

      <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{challenge.description}</p>

      <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 p-5">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-3">
          Instruções
        </h2>
        <pre className="text-sm whitespace-pre-wrap text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">
          {challenge.instructions}
        </pre>
      </div>

      <StartChallengeButton
        challengeId={challenge.id}
        existingSandboxId={existingSandbox?.id}
      />
    </div>
  )
}
