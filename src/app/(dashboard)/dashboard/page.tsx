import { getRequiredSession } from "@/lib/session"
import { db } from "@/lib/db"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function DashboardPage() {
  const session = await getRequiredSession()

  const sandboxes = await db.sandbox.findMany({
    where: { userId: session.user.id },
    include: { challenge: true, report: true },
    orderBy: { startedAt: "desc" },
  })

  const completed = sandboxes.filter((s) => s.status === "EVALUATED").length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">
          Olá, {session.user.name?.split(" ")[0]}
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
          {sandboxes.length === 0
            ? "Você ainda não iniciou nenhum desafio."
            : `${completed} desafio${completed !== 1 ? "s" : ""} concluído${completed !== 1 ? "s" : ""}`}
        </p>
      </div>

      {sandboxes.length === 0 ? (
        <div className="text-center py-16 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900">
          <p className="text-zinc-500 dark:text-zinc-400 mb-4">Comece seu primeiro desafio agora</p>
          <Button asChild variant="outline" className="border-violet-300 dark:border-violet-800 text-violet-700 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950 hover:border-violet-400">
            <Link href="/challenges">Ver desafios disponíveis</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {sandboxes.map((sandbox) => (
            <div
              key={sandbox.id}
              className="flex items-center justify-between border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-white dark:bg-zinc-900"
            >
              <div>
                <p className="font-medium text-sm">{sandbox.challenge.title}</p>
                <p className="text-xs text-zinc-400 mt-0.5 capitalize">
                  {sandbox.status.toLowerCase().replace("_", " ")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {sandbox.report && (
                  <span className={`text-sm font-bold tabular-nums ${
                    sandbox.report.scoreTotal >= 80
                      ? "text-emerald-600 dark:text-emerald-400"
                      : sandbox.report.scoreTotal >= 60
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-red-600 dark:text-red-400"
                  }`}>
                    {sandbox.report.scoreTotal.toFixed(1)} pts
                  </span>
                )}
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className={
                    sandbox.status === "EVALUATED"
                      ? "border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 hover:border-blue-400"
                      : "border-violet-300 dark:border-violet-800 text-violet-700 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950 hover:border-violet-400"
                  }
                >
                  <Link href={sandbox.status === "EVALUATED" ? `/reports/${sandbox.id}` : `/sandbox/${sandbox.id}`}>
                    {sandbox.status === "EVALUATED" ? "Ver Relatório" : "Continuar"}
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
