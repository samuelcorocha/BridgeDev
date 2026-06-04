import { getRequiredSession } from "@/lib/session"
import { db } from "@/lib/db"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const STATUS_STYLES: Record<string, string> = {
  PROVISIONING: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  READY:        "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
  IN_PROGRESS:  "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  SUBMITTED:    "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  EVALUATED:    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  FAILED:       "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
}

const STATUS_LABELS: Record<string, string> = {
  PROVISIONING: "Provisionando",
  READY:        "Pronto",
  IN_PROGRESS:  "Em andamento",
  SUBMITTED:    "Submetido",
  EVALUATED:    "Avaliado",
  FAILED:       "Falhou",
}

export default async function DashboardPage() {
  const session = await getRequiredSession()

  const sandboxes = await db.sandbox.findMany({
    where: { userId: session.user.id },
    include: { challenge: true, report: true },
    orderBy: { startedAt: "desc" },
  })

  const completed = sandboxes.filter((s) => s.status === "EVALUATED").length
  const firstName = session.user.name?.split(" ")[0]

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-xl bg-gradient-to-br from-violet-950 via-violet-800 to-purple-700 p-6">
        <h1 className="text-2xl font-bold text-white">Olá, {firstName}</h1>
        <p className="text-white/70 text-sm mt-1">
          {sandboxes.length === 0
            ? "Você ainda não iniciou nenhum desafio."
            : `${completed} desafio${completed !== 1 ? "s" : ""} concluído${completed !== 1 ? "s" : ""}`}
        </p>
      </div>

      {sandboxes.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800 rounded-xl">
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
              className="flex items-center justify-between bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md border border-zinc-100 dark:border-zinc-800 rounded-xl p-4 transition-shadow duration-200"
            >
              <div>
                <p className="font-medium text-sm">{sandbox.challenge.title}</p>
                <span className={`inline-block text-xs px-2 py-0.5 rounded font-medium mt-1 ${STATUS_STYLES[sandbox.status] ?? STATUS_STYLES.PROVISIONING}`}>
                  {STATUS_LABELS[sandbox.status] ?? sandbox.status}
                </span>
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
