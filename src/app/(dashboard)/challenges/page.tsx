import { db } from "@/lib/db"
import { getRequiredSession } from "@/lib/session"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const DIFFICULTY_LABELS = {
  BEGINNER: "Iniciante",
  INTERMEDIATE: "Intermediário",
  ADVANCED: "Avançado",
}

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
              className="border border-zinc-200 rounded-xl p-5 flex flex-col gap-4 bg-white"
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <h2 className="font-semibold text-sm">{challenge.title}</h2>
                  <span className="text-xs text-zinc-400 border border-zinc-200 rounded px-2 py-0.5 shrink-0">
                    {DIFFICULTY_LABELS[challenge.difficulty]}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-2 line-clamp-3">
                  {challenge.description}
                </p>
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

              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs text-zinc-400">
                  {challenge.estimatedMinutes}min
                </span>
                <Button
                  asChild
                  size="sm"
                  variant={sandbox ? "outline" : "default"}
                >
                  <Link
                    href={
                      sandbox
                        ? `/sandbox/${sandbox.id}`
                        : `/challenges/${challenge.slug}`
                    }
                  >
                    {sandbox ? "Continuar" : "Iniciar"}
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
