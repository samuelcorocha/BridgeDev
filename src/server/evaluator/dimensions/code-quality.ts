import type { EvaluatorInput, DimensionResult } from "../types"

const CONFIG_FILES = [".eslintrc", ".eslintrc.js", ".eslintrc.json", ".eslintrc.yml", "eslint.config", ".prettierrc", ".prettierrc.js", "prettier.config"]
const SMELL_PATTERNS = ["console.log", "var ", "eval(", "setTimeout(0", "any>"]

export function scoreCodeQuality(input: EvaluatorInput): DimensionResult {
  const points: string[] = []
  const improvements: string[] = []

  // Verifica check_run de lint no CI (caminho ideal)
  const checkRuns = input.events
    .filter((e) => e.type === "check_run")
    .map((e) => e.payload as { check_run?: { name: string; conclusion: string; output?: { annotations_count?: number } } })

  const lintCheck = checkRuns.find((p) => {
    const name = p.check_run?.name?.toLowerCase() ?? ""
    return name.includes("lint") || name.includes("eslint")
  })

  // Analisa arquivos modificados nos pushes
  const pushPayloads = input.events
    .filter((e) => e.type === "push")
    .map((e) => e.payload as { commits?: { added?: string[]; modified?: string[]; message?: string }[] })

  const allFiles = pushPayloads.flatMap((p) =>
    (p.commits ?? []).flatMap((c) => [...(c.added ?? []), ...(c.modified ?? [])])
  )

  const hasLintConfig = allFiles.some((f) =>
    CONFIG_FILES.some((cfg) => f.toLowerCase().includes(cfg))
  )

  const sourceFiles = allFiles.filter((f) =>
    f.endsWith(".js") || f.endsWith(".ts") || f.endsWith(".tsx") || f.endsWith(".jsx")
  )

  // Se tem CI com lint — usa como fonte primária
  if (lintCheck) {
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

  // Sem CI — avalia pelo que os arquivos indicam
  let score = 40

  if (hasLintConfig) {
    score += 20
    points.push("Configuração de linter adicionada ao projeto")
  } else {
    improvements.push("Adicione ESLint ou Prettier ao projeto")
  }

  if (sourceFiles.length > 0) {
    // Verifica separação em módulos (arquivos em subpastas)
    const inSubfolders = sourceFiles.filter((f) => f.split("/").length > 2)
    if (inSubfolders.length >= 3) {
      score += 20
      points.push("Código organizado em módulos/camadas")
    } else if (inSubfolders.length >= 1) {
      score += 10
      points.push("Alguma organização em módulos detectada")
    } else {
      improvements.push("Organize o código em camadas (routes/, services/, middleware/)")
    }
  }

  if (score < 60) {
    improvements.push("Configure ESLint no CI para pontuação completa")
  }

  return { score: Math.min(100, score), points, improvements }
}
