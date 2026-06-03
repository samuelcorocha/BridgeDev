import type { EvaluatorInput, DimensionResult } from "../types"

const CONVENTIONAL_RE = /^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .{3,}/

export function scoreGit(input: EvaluatorInput): DimensionResult {
  const points: string[] = []
  const improvements: string[] = []

  const pushEvents = input.events.filter((e) => e.type === "push")

  const allCommits: string[] = pushEvents.flatMap((e) => {
    const payload = e.payload as { commits?: { message: string }[] }
    return (payload.commits ?? []).map((c) => c.message)
  })

  const realCommits = allCommits.filter((m) => !m.startsWith("Merge"))

  let score = 0
  if (realCommits.length >= 10) {
    score = 70
    points.push("Histórico de commits rico")
  } else if (realCommits.length >= 5) {
    score = 55
    points.push("Bom número de commits")
  } else if (realCommits.length >= 2) {
    score = 35
  } else {
    score = 10
    improvements.push("Faça commits menores e mais frequentes")
  }

  const conventionalCount = realCommits.filter((m) => CONVENTIONAL_RE.test(m)).length
  const conventionalRatio = realCommits.length > 0 ? conventionalCount / realCommits.length : 0

  if (conventionalRatio >= 0.8) {
    score = Math.min(100, score + 20)
    points.push("Mensagens de commit seguem Conventional Commits")
  } else if (conventionalRatio >= 0.5) {
    score = Math.min(100, score + 10)
  } else {
    improvements.push("Use Conventional Commits (feat:, fix:, docs: etc.)")
  }

  const prEvents = input.events.filter((e) => e.type === "pull_request")
  const hasPrWithDescription = prEvents.some((e) => {
    const payload = e.payload as { pull_request?: { body?: string }; action?: string }
    return payload.action === "opened" && (payload.pull_request?.body?.length ?? 0) >= 50
  })

  if (hasPrWithDescription) {
    score = Math.min(100, score + 10)
    points.push("PR aberto com descrição clara")
  } else {
    improvements.push("Abra um Pull Request descrevendo suas mudanças")
  }

  return { score: Math.min(100, score), points, improvements }
}
