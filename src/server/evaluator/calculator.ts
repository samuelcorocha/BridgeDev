import type { Sandbox, SandboxEvent, Challenge, ReadinessReport } from "@prisma/client"
import type { ScoreBreakdown, ReportFeedback } from "@/types"
import type { EvaluatorInput } from "./types"
import { scoreGit } from "./dimensions/git"
import { scoreTests } from "./dimensions/tests"
import { scoreCodeQuality } from "./dimensions/code-quality"
import { scoreDocs } from "./dimensions/docs"
import { scoreDelivery } from "./dimensions/delivery"

const WEIGHTS = {
  git: 0.25,
  tests: 0.25,
  codeQuality: 0.2,
  docs: 0.15,
  delivery: 0.15,
}

type SandboxWithDeps = Sandbox & {
  challenge: Challenge
  events: SandboxEvent[]
  report: ReadinessReport | null
}

export function calculateScore(
  sandbox: SandboxWithDeps
): ScoreBreakdown & { feedback: ReportFeedback[] } {
  const input: EvaluatorInput = {
    sandboxId: sandbox.id,
    challengeId: sandbox.challengeId,
    estimatedMinutes: sandbox.challenge.estimatedMinutes,
    startedAt: sandbox.startedAt,
    submittedAt: sandbox.submittedAt ?? new Date(),
    events: sandbox.events,
  }

  const results = {
    git: scoreGit(input),
    tests: scoreTests(input),
    codeQuality: scoreCodeQuality(input),
    docs: scoreDocs(input),
    delivery: scoreDelivery(input),
  }

  const total = Object.entries(WEIGHTS).reduce(
    (acc, [key, weight]) =>
      acc + results[key as keyof typeof results].score * weight,
    0
  )

  const feedback: ReportFeedback[] = Object.entries(results).map(
    ([dimension, result]) => ({
      dimension: dimension as ReportFeedback["dimension"],
      score: result.score,
      points: result.points,
      improvements: result.improvements,
    })
  )

  return {
    git: results.git.score,
    tests: results.tests.score,
    codeQuality: results.codeQuality.score,
    docs: results.docs.score,
    delivery: results.delivery.score,
    total: Math.round(total * 10) / 10,
    feedback,
  }
}
