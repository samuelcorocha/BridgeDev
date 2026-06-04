import { db } from "@/lib/db"
import { getRequiredSession } from "@/lib/session"
import { notFound } from "next/navigation"
import { StartChallengeButton } from "@/components/challenges/start-challenge-button"
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS, TECH_COLORS, DEFAULT_TECH } from "@/lib/challenge-colors"

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
      {/* Banner */}
      <div className="rounded-xl bg-gradient-to-br from-violet-950 via-violet-800 to-purple-700 p-6">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-white">{challenge.title}</h1>
          <span className={`text-xs px-2 py-0.5 rounded font-medium ${DIFFICULTY_COLORS[challenge.difficulty]}`}>
            {DIFFICULTY_LABELS[challenge.difficulty]}
          </span>
        </div>
        <p className="text-white/70 text-sm">{challenge.estimatedMinutes} minutos estimados</p>
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

      <div className="bg-white dark:bg-zinc-900 shadow-sm border border-violet-100 dark:border-violet-900 rounded-xl p-5">
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
