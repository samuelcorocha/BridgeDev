import { db } from "@/lib/db"
import { getRequiredSession } from "@/lib/session"
import { notFound } from "next/navigation"
import { StartChallengeButton } from "@/components/challenges/start-challenge-button"

const DIFFICULTY_LABELS = {
  BEGINNER: "Iniciante",
  INTERMEDIATE: "Intermediário",
  ADVANCED: "Avançado",
}

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
        <h1 className="text-2xl font-bold">{challenge.title}</h1>
        <div className="flex gap-4 text-sm text-zinc-500 mt-1">
          <span>{DIFFICULTY_LABELS[challenge.difficulty]}</span>
          <span>{challenge.estimatedMinutes} minutos estimados</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {challenge.stack.map((s) => (
          <span
            key={s}
            className="text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded"
          >
            {s}
          </span>
        ))}
      </div>

      <p className="text-zinc-600 leading-relaxed">{challenge.description}</p>

      <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-5">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-zinc-500 mb-3">
          Instruções
        </h2>
        <pre className="text-sm whitespace-pre-wrap text-zinc-700 leading-relaxed font-sans">
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
