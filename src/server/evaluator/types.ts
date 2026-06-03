import type { SandboxEvent } from "@prisma/client"

export interface EvaluatorInput {
  sandboxId: string
  challengeId: string
  estimatedMinutes: number
  startedAt: Date
  submittedAt: Date
  events: SandboxEvent[]
}

export interface DimensionResult {
  score: number
  points: string[]
  improvements: string[]
}
