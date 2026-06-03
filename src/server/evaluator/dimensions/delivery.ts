import type { EvaluatorInput, DimensionResult } from "../types"

export function scoreDelivery(input: EvaluatorInput): DimensionResult {
  const points: string[] = []
  const improvements: string[] = []

  const minutesUsed =
    (input.submittedAt.getTime() - input.startedAt.getTime()) / 60_000
  const ratio = minutesUsed / input.estimatedMinutes

  let score: number

  if (ratio <= 0.8) {
    score = 100
    points.push(
      `Entregue em ${Math.round(minutesUsed)}min (${Math.round(ratio * 100)}% do tempo estimado)`
    )
  } else if (ratio <= 1.0) {
    score = 85
    points.push("Entregue dentro do prazo estimado")
  } else if (ratio <= 1.2) {
    score = 70
    improvements.push("Ultrapassou o tempo em até 20% — trabalhe o gerenciamento de tempo")
  } else if (ratio <= 1.5) {
    score = 50
    improvements.push(
      `Tempo utilizado: ${Math.round(minutesUsed)}min vs ${input.estimatedMinutes}min estimados`
    )
  } else {
    score = 20
    improvements.push(
      "Tempo muito acima do estimado — pratique dividir tarefas em entregas menores"
    )
  }

  return { score, points, improvements }
}
