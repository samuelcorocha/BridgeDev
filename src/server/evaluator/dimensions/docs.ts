import type { EvaluatorInput, DimensionResult } from "../types"

export function scoreDocs(input: EvaluatorInput): DimensionResult {
  const points: string[] = []
  const improvements: string[] = []

  const pushPayloads = input.events
    .filter((e) => e.type === "push")
    .map(
      (e) =>
        e.payload as { commits?: { added?: string[]; modified?: string[] }[] }
    )

  const allModifiedFiles = pushPayloads.flatMap((p) =>
    (p.commits ?? []).flatMap((c) => [...(c.added ?? []), ...(c.modified ?? [])])
  )

  const hasReadme = allModifiedFiles.some((f) => f.toLowerCase().includes("readme"))

  if (!hasReadme) {
    improvements.push(
      "Atualize o README com o que foi feito, como rodar e suas decisões técnicas"
    )
    return { score: 10, points, improvements }
  }

  points.push("README atualizado")

  const readmeCommitCount = pushPayloads.flatMap((p) =>
    (p.commits ?? []).filter((c) =>
      [...(c.added ?? []), ...(c.modified ?? [])].some((f) =>
        f.toLowerCase().includes("readme")
      )
    )
  ).length

  if (readmeCommitCount >= 3) {
    points.push("Documentação iterada ao longo do desafio")
    return { score: 100, points, improvements }
  }

  if (readmeCommitCount >= 2) {
    return { score: 80, points, improvements }
  }

  improvements.push(
    "Adicione: como rodar o projeto, decisões técnicas tomadas e o que melhoraria"
  )
  return { score: 60, points, improvements }
}
