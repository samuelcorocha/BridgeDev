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

export function ReportView({ report }: { report: ReportWithDeps }) {
  const feedback = report.feedback as unknown as ReportFeedback[]
  const issuedAt = new Date(report.createdAt).toLocaleDateString("pt-BR")

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Relatório de Prontidão</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            {report.sandbox.challenge.title} · Emitido em {issuedAt}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 hover:border-blue-400">
          <a href={`/api/reports/${report.sandboxId}/pdf`} download>
            Baixar PDF
          </a>
        </Button>
      </div>

      <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 p-6 flex items-center gap-6">
        <ScoreGauge score={report.scoreTotal} />
        <div>
          <p className={`text-5xl font-bold ${
            report.scoreTotal >= 80 ? "text-emerald-600 dark:text-emerald-400"
            : report.scoreTotal >= 60 ? "text-amber-600 dark:text-amber-400"
            : "text-red-600 dark:text-red-400"
          }`}>
            {report.scoreTotal.toFixed(1)}
          </p>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">de 100 pontos</p>
          {report.certified ? (
            <span className="inline-block mt-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 text-xs px-3 py-1 rounded-full font-medium">
              Certificado de Prontidão Emitido
            </span>
          ) : (
            <span className="inline-block mt-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs px-3 py-1 rounded-full">
              Mínimo para certificado: 70 pontos
            </span>
          )}
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
