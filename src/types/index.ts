import type { Challenge, Sandbox, ReadinessReport } from "@prisma/client"

export type SandboxWithChallenge = Sandbox & { challenge: Challenge }
export type SandboxWithReport = Sandbox & { report: ReadinessReport | null }
export type SandboxFull = Sandbox & { challenge: Challenge; report: ReadinessReport | null }

export interface ReportFeedback {
  dimension: "git" | "tests" | "codeQuality" | "docs" | "delivery"
  score: number
  points: string[]
  improvements: string[]
}

export interface ScoreBreakdown {
  git: number
  tests: number
  codeQuality: number
  docs: number
  delivery: number
  total: number
}
