import type { EvaluatorInput, DimensionResult } from "../types"

export function scoreTests(input: EvaluatorInput): DimensionResult {
  const points: string[] = []
  const improvements: string[] = []

  // Verifica check_run de CI com testes (caminho ideal)
  const checkRuns = input.events
    .filter((e) => e.type === "check_run")
    .map((e) => e.payload as { check_run?: { name: string; conclusion: string; output?: { summary?: string } } })

  const testCheck = checkRuns.find((p) => {
    const name = p.check_run?.name?.toLowerCase() ?? ""
    return name.includes("test") || name.includes("jest") || name.includes("vitest")
  })

  // Analisa arquivos modificados nos pushes
  const pushPayloads = input.events
    .filter((e) => e.type === "push")
    .map((e) => e.payload as { commits?: { added?: string[]; modified?: string[]; removed?: string[] }[] })

  const allFiles = pushPayloads.flatMap((p) =>
    (p.commits ?? []).flatMap((c) => [...(c.added ?? []), ...(c.modified ?? [])])
  )

  const testFiles = allFiles.filter((f) =>
    f.includes(".test.") || f.includes(".spec.") || f.includes("__tests__") || f.includes("/tests/")
  )

  const hasTestFiles = testFiles.length > 0

  // Se tem CI com testes — usa ele como fonte primária
  if (testCheck) {
    if (testCheck.check_run?.conclusion !== "success") {
      improvements.push("Os testes estão falhando — corrija antes de submeter")
      return { score: 20, points, improvements }
    }

    points.push("Testes passando no CI")
    let score = 60

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
        improvements.push(`Cobertura de ${coverage.toFixed(0)}% — aumente para ao menos 70%`)
      } else {
        score = 40
        improvements.push(`Cobertura de ${coverage.toFixed(0)}% — aumente para ao menos 70%`)
      }
    } else {
      improvements.push("Configure relatório de cobertura no CI para pontuação completa")
    }

    return { score, points, improvements }
  }

  // Sem CI — analisa arquivos de teste nos commits
  if (!hasTestFiles) {
    improvements.push("Nenhum arquivo de teste detectado nos commits")
    improvements.push("Adicione testes unitários (*.test.js, *.spec.js ou pasta __tests__)")
    return { score: 0, points, improvements }
  }

  points.push(`${testFiles.length} arquivo(s) de teste adicionado(s)/modificado(s)`)

  // Quanto mais arquivos de teste, melhor
  let score = 40
  if (testFiles.length >= 5) {
    score = 75
    points.push("Boa cobertura de arquivos de teste")
  } else if (testFiles.length >= 3) {
    score = 60
  }

  improvements.push("Configure CI para rodar os testes automaticamente e obter pontuação completa")

  return { score, points, improvements }
}
