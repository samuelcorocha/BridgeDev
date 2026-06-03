import type { EvaluatorInput, DimensionResult } from "../types"

export function scoreCodeQuality(input: EvaluatorInput): DimensionResult {
  const points: string[] = []
  const improvements: string[] = []

  const checkRuns = input.events
    .filter((e) => e.type === "check_run")
    .map(
      (e) =>
        e.payload as {
          check_run?: {
            name: string
            conclusion: string
            output?: { annotations_count?: number }
          }
        }
    )

  const lintCheck = checkRuns.find((p) => {
    const name = p.check_run?.name?.toLowerCase() ?? ""
    return name.includes("lint") || name.includes("eslint")
  })

  if (!lintCheck) {
    improvements.push("Configure ESLint/Prettier e rode no CI")
    return { score: 30, points, improvements }
  }

  if (lintCheck.check_run?.conclusion !== "success") {
    improvements.push("Lint falhando — corrija os erros antes de submeter")
    return { score: 10, points, improvements }
  }

  points.push("Lint passando sem erros")
  const annotations = lintCheck.check_run?.output?.annotations_count ?? 0

  if (annotations === 0) {
    points.push("Nenhum warning de linting")
    return { score: 100, points, improvements }
  }

  if (annotations <= 5) {
    improvements.push(`${annotations} warning(s) de lint — tente eliminar todos`)
    return { score: 80, points, improvements }
  }

  improvements.push(`${annotations} warnings de lint — reduza significativamente`)
  return { score: 60, points, improvements }
}
