import { db } from "@/lib/db"
import { getRequiredSession } from "@/lib/session"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS, TECH_COLORS, DEFAULT_TECH } from "@/lib/challenge-colors"

export default async function ChallengesPage() {
  const session = await getRequiredSession()

  const [challenges, userSandboxes] = await Promise.all([
    db.challenge.findMany({
      where: { isActive: true },
      orderBy: { difficulty: "asc" },
    }),
    db.sandbox.findMany({
      where: { userId: session.user.id },
      select: { challengeId: true, id: true, status: true },
    }),
  ])

  const sandboxByChallenge = Object.fromEntries(
    userSandboxes.map((s) => [s.challengeId, s])
  )

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Desafios</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {challenges.map((challenge) => {
          const sandbox = sandboxByChallenge[challenge.id]

          return (
            <div
              key={challenge.id}
              className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 flex flex-col gap-4 bg-white dark:bg-zinc-900 hover:border-violet-300 dark:hover:border-violet-800 transition-colors"
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <h2 className="font-semibold text-sm">{challenge.title}</h2>
                  <span className={`text-xs border rounded px-2 py-0.5 shrink-0 font-medium ${DIFFICULTY_COLORS[challenge.difficulty]}`}>
                    {DIFFICULTY_LABELS[challenge.difficulty]}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 line-clamp-3">
                  {challenge.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-1">
                {challenge.stack.map((s) => (
                  <span
                    key={s}
                    className={`text-xs px-2 py-0.5 rounded font-medium ${TECH_COLORS[s] ?? DEFAULT_TECH}`}
                  >
                    {s}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs text-zinc-400">{challenge.estimatedMinutes}min</span>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="border-violet-300 dark:border-violet-800 text-violet-700 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950 hover:border-violet-400"
                >
                  <Link href={sandbox ? `/sandbox/${sandbox.id}` : `/challenges/${challenge.slug}`}>
                    {sandbox ? "Continuar" : "Iniciar desafio"}
                  </Link>
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
