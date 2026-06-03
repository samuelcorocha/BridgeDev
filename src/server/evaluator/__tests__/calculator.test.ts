import { describe, it, expect } from "vitest"
import { calculateScore } from "../calculator"
import type { Sandbox, Challenge, SandboxEvent, ReadinessReport } from "@prisma/client"

type SandboxWithDeps = Sandbox & {
  challenge: Challenge
  events: SandboxEvent[]
  report: ReadinessReport | null
}

function makeSandbox(overrides: Partial<SandboxWithDeps> = {}): SandboxWithDeps {
  const now = new Date("2026-06-01T10:00:00Z")
  const submitted = new Date("2026-06-01T11:00:00Z") // 60min depois

  const base: SandboxWithDeps = {
    id: "sandbox-1",
    userId: "user-1",
    challengeId: "challenge-1",
    codespaceId: null,
    codespaceUrl: null,
    forkRepo: null,
    status: "SUBMITTED",
    startedAt: now,
    submittedAt: submitted,
    finishedAt: null,
    challenge: {
      id: "challenge-1",
      slug: "test",
      title: "Test Challenge",
      description: "",
      difficulty: "INTERMEDIATE",
      estimatedMinutes: 60,
      stack: [],
      templateRepo: "org/repo",
      instructions: "",
      isActive: true,
      createdAt: now,
    },
    events: [],
    report: null,
  }

  return { ...base, ...overrides }
}

function makePushEvent(commits: { message: string; modified?: string[] }[]): SandboxEvent {
  return {
    id: "evt-1",
    sandboxId: "sandbox-1",
    type: "push",
    payload: { commits: commits.map((c) => ({ message: c.message, modified: c.modified ?? [], added: [] })) },
    receivedAt: new Date(),
  }
}

function makeCheckRunEvent(name: string, conclusion: string, summary = ""): SandboxEvent {
  return {
    id: "evt-cr",
    sandboxId: "sandbox-1",
    type: "check_run",
    payload: { check_run: { name, conclusion, output: { summary, annotations_count: 0 } } },
    receivedAt: new Date(),
  }
}

describe("calculateScore", () => {
  it("retorna score total entre 0 e 100", () => {
    const result = calculateScore(makeSandbox())
    expect(result.total).toBeGreaterThanOrEqual(0)
    expect(result.total).toBeLessThanOrEqual(100)
  })

  it("sandbox sem eventos tem score baixo", () => {
    const result = calculateScore(makeSandbox())
    expect(result.total).toBeLessThan(40)
  })

  it("feedback tem 5 entradas (uma por dimensão)", () => {
    const result = calculateScore(makeSandbox())
    expect(result.feedback).toHaveLength(5)
    const dimensions = result.feedback.map((f) => f.dimension)
    expect(dimensions).toContain("git")
    expect(dimensions).toContain("tests")
    expect(dimensions).toContain("codeQuality")
    expect(dimensions).toContain("docs")
    expect(dimensions).toContain("delivery")
  })

  it("delivery = 100 quando entregue em 80% do tempo", () => {
    const now = new Date("2026-06-01T10:00:00Z")
    const submitted = new Date("2026-06-01T10:48:00Z") // 48min para 60min estimado
    const result = calculateScore(makeSandbox({ startedAt: now, submittedAt: submitted }))
    expect(result.delivery).toBe(100)
  })

  it("delivery = 85 quando entregue exatamente no prazo", () => {
    const now = new Date("2026-06-01T10:00:00Z")
    const submitted = new Date("2026-06-01T11:00:00Z") // exatos 60min
    const result = calculateScore(makeSandbox({ startedAt: now, submittedAt: submitted }))
    expect(result.delivery).toBe(85)
  })

  it("git score aumenta com commits convencionais", () => {
    const events = [
      makePushEvent([
        { message: "feat: add user authentication" },
        { message: "fix: resolve login bug" },
        { message: "docs: update README" },
        { message: "test: add unit tests" },
        { message: "refactor: extract service layer" },
      ]),
    ]
    const result = calculateScore(makeSandbox({ events }))
    expect(result.git).toBeGreaterThan(50)
  })

  it("tests score 0 quando sem check_run de testes", () => {
    const result = calculateScore(makeSandbox({ events: [] }))
    expect(result.tests).toBe(0)
  })

  it("tests score 50 com testes passando mas sem cobertura reportada", () => {
    const events = [makeCheckRunEvent("vitest", "success")]
    const result = calculateScore(makeSandbox({ events }))
    expect(result.tests).toBe(50)
  })

  it("tests score 100 com cobertura >= 90%", () => {
    const events = [makeCheckRunEvent("vitest", "success", "Coverage: 93.5%")]
    const result = calculateScore(makeSandbox({ events }))
    expect(result.tests).toBe(100)
  })

  it("codeQuality score 100 com lint passando sem warnings", () => {
    const events = [makeCheckRunEvent("eslint", "success")]
    const result = calculateScore(makeSandbox({ events }))
    expect(result.codeQuality).toBe(100)
  })

  it("docs score aumenta com README modificado múltiplas vezes", () => {
    const events = [
      makePushEvent([{ message: "docs: update readme", modified: ["README.md"] }]),
      makePushEvent([{ message: "docs: add setup instructions", modified: ["README.md"] }]),
      makePushEvent([{ message: "docs: add examples", modified: ["README.md"] }]),
    ]
    const result = calculateScore(makeSandbox({ events }))
    expect(result.docs).toBe(100)
  })

  it("score total é média ponderada correta", () => {
    const result = calculateScore(makeSandbox())
    const expectedTotal =
      result.git * 0.25 +
      result.tests * 0.25 +
      result.codeQuality * 0.2 +
      result.docs * 0.15 +
      result.delivery * 0.15
    expect(result.total).toBeCloseTo(expectedTotal, 0)
  })
})
