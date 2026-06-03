import type { EvaluatorInput, DimensionResult } from "../types"

export function scoreTests(input: EvaluatorInput): DimensionResult {
  const points: string[] = []
  const improvements: string[] = []

  const checkRuns = input.events
    .filter((e) => e.type === "check_run")
    .map(
      (e) =>
        e.payload as {
          check_run?: { name: string; conclusion: string; output?: { summary?: string } }
        }
    )

  const testCheck = checkRuns.find((p) => {
    const name = p.check_run?.name?.toLowerCase() ?? ""
    return name.includes("test") || name.includes("jest") || name.includes("vitest")
  })

  if (!testCheck) {
    improvements.push("Nenhum teste automatizado detectado")
    improvements.push("Configure Jest ou Vitest e rode os testes no CI")
    return { score: 0, points, improvements }
  }

  if (testCheck.check_run?.conclusion !== "success") {
    improvements.push("Os testes estão falhando — corrija antes de submeter")
    return { score: 20, points, improvements }
  }

  points.push("Testes passando no CI")
  let score = 50

  const summary = testCheck.check_run?.output?.summary ?? ""
  const coverageMatch = summary.match(/(\d+(?:\.\d+)?)\s*%/)
  const coverage = coverageMatch ? parseFloat(coverageMatch[1]) : null

  if (coverage !== null) {
    if (coverage >= 90) {
      score = 100
      points.push(`Cobertura de ${coverage.toFixed(0)}% — excelente`)
    } else if (coverage >= 80) {
      score = 85
      points.push(`Cobertura de ${coverage.toFixed(0)}% — muito boa`)
    } else if (coverage >= 70) {
      score = 75
      points.push(`Cobertura de ${coverage.toFixed(0)}%`)
    } else if (coverage >= 50) {
      score = 60
    } else {
      score = 40
      improvements.push(`Cobertura de ${coverage.toFixed(0)}% — aumente para ao menos 70%`)
    }
  } else {
    improvements.push("Configure relatório de cobertura no CI para pontuação completa")
  }

  return { score, points, improvements }
}
