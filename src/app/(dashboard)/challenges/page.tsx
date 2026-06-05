import { db } from "@/lib/db"
import { getRequiredSession } from "@/lib/session"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TECH_COLORS, DEFAULT_TECH } from "@/lib/challenge-colors"

const DIFFICULTY_BAR_COLORS: Record<string, string> = {
  BEGINNER: "from-emerald-400 to-emerald-500",
  INTERMEDIATE: "from-amber-400 to-amber-500",
  ADVANCED: "from-red-400 to-red-500",
}

const DIFFICULTY_BLOCK_COLORS: Record<string, string> = {
  BEGINNER: "bg-emerald-500",
  INTERMEDIATE: "bg-amber-500",
  ADVANCED: "bg-red-500",
}

const DIFFICULTY_FILLED_BLOCKS: Record<string, number> = {
  BEGINNER: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3,
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
      <div className="rounded-xl bg-gradient-to-br from-violet-950 via-violet-800 to-purple-700 p-6">
        <h1 className="text-2xl font-bold text-white">Desafios</h1>
        <p className="text-white/70 text-sm mt-1">Escolha um ambiente para testar sua prontidão técnica</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {challenges.map((challenge) => {
          const sandbox = sandboxByChallenge[challenge.id]
          const filledBlocks = DIFFICULTY_FILLED_BLOCKS[challenge.difficulty] ?? 1

          return (
            <div
              key={challenge.id}
              className="relative bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden flex flex-col gap-4 p-5 pt-6 hover:border-violet-200 dark:hover:border-violet-800 transition-all duration-200"
            >
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${DIFFICULTY_BAR_COLORS[challenge.difficulty] ?? "from-zinc-300 to-zinc-400"}`} />

              <div>
                <h2 className="font-semibold text-sm mb-2">{challenge.title}</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3">
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
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className={`w-3 h-1.5 rounded-sm ${
                          i < filledBlocks
                            ? (DIFFICULTY_BLOCK_COLORS[challenge.difficulty] ?? "bg-zinc-400")
                            : "bg-zinc-200 dark:bg-zinc-700"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-zinc-400">{challenge.estimatedMinutes}min</span>
                </div>
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
