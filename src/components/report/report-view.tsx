import type { ReadinessReport, Sandbox, Challenge } from "@prisma/client"
import type { ReportFeedback } from "@/types"
import { ScoreGauge } from "./score-gauge"
import { DimensionCard } from "./dimension-card"
import { Button } from "@/components/ui/button"

type ReportWithDeps = ReadinessReport & {
  sandbox: Sandbox & { challenge: Challenge }
}

const DIMENSION_LABELS: Record<string, string> = {
  git: "Git & Versionamento",
  tests: "Cobertura de Testes",
  codeQuality: "Qualidade de Código",
  docs: "Documentação",
  delivery: "Entrega no Prazo",
}

const DIMENSION_SHORT: Record<string, string> = {
  git: "Git",
  tests: "Testes",
  codeQuality: "Código",
  docs: "Docs",
  delivery: "Entrega",
}

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400"
  if (score >= 60) return "text-amber-600 dark:text-amber-400"
  return "text-red-600 dark:text-red-400"
}

function barColor(score: number) {
  if (score >= 80) return "bg-emerald-500"
  if (score >= 60) return "bg-amber-500"
  return "bg-red-500"
}

export function ReportView({ report }: { report: ReportWithDeps }) {
  const feedback = report.feedback as unknown as ReportFeedback[]
  const issuedAt = new Date(report.createdAt).toLocaleDateString("pt-BR")

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Banner */}
      <div className="rounded-xl bg-gradient-to-br from-violet-950 via-violet-800 to-purple-700 p-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Relatório de Prontidão</h1>
          <p className="text-white/70 text-sm mt-1">
            {report.sandbox.challenge.title} · Emitido em {issuedAt}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 shrink-0">
          <a href={`/api/reports/${report.sandboxId}/pdf`} download>
            Baixar PDF
          </a>
        </Button>
      </div>

      {/* Score card horizontal */}
      <div className="bg-white dark:bg-zinc-900 shadow-md border border-violet-100 dark:border-violet-900 rounded-xl p-6 flex items-center gap-6">
        <ScoreGauge score={report.scoreTotal} size={80} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1 flex-wrap">
            <p className={`text-4xl font-black ${scoreColor(report.scoreTotal)}`}>
              {report.scoreTotal.toFixed(1)}
            </p>
            <p className="text-zinc-400 dark:text-zinc-500 text-sm">/ 100 pts</p>
            {report.certified ? (
              <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-medium">
                ✓ Certificado
              </span>
            ) : (
              <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-xs px-2.5 py-0.5 rounded-full">
                Mín. 70 pts
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1.5 mt-3">
            {feedback.map((f) => (
              <div key={f.dimension} className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 dark:text-zinc-500 w-14 shrink-0">
                  {DIMENSION_SHORT[f.dimension] ?? f.dimension}
                </span>
                <div className="flex-1 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${barColor(f.score)}`}
                    style={{ width: `${f.score}%` }}
                  />
                </div>
                <span className={`text-xs font-medium w-6 text-right ${scoreColor(f.score)}`}>
                  {f.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {feedback.map((f) => (
          <DimensionCard
            key={f.dimension}
            label={DIMENSION_LABELS[f.dimension] ?? f.dimension}
            score={f.score}
            points={f.points}
            improvements={f.improvements}
          />
        ))}
      </div>
    </div>
  )
}
