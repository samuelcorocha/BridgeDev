# Interior + Login Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesenhar a página de login (split screen roxo) e todas as páginas internas (banner roxo + cards elevados) mantendo dark mode e sem alterar lógica de negócio.

**Architecture:** Cada arquivo é modificado independentemente — sem novos componentes. O banner roxo é implementado inline em cada página (evitar over-abstração no MVP). O padrão de card elevado substitui o flat border atual.

**Tech Stack:** Next.js 14 App Router, Tailwind CSS, TypeScript, shadcn/ui Button, classes CSS customizadas já em `globals.css` (`gradient-text`, `violet-glow-sm`).

---

## Arquivos a modificar

| Arquivo | O que muda |
|---|---|
| `src/app/(auth)/login/page.tsx` | Layout split screen 50/50 |
| `src/app/(dashboard)/dashboard/page.tsx` | Banner roxo + cards com shadow |
| `src/app/(dashboard)/challenges/page.tsx` | Banner roxo + cards com shadow + glow |
| `src/app/(dashboard)/challenges/[slug]/page.tsx` | Banner roxo + card instruções com borda violet |
| `src/components/sandbox/sandbox-view.tsx` | Banner roxo + cards com shadow |
| `src/components/report/report-view.tsx` | Banner roxo dentro do header + card score com shadow-md |

---

## Task 1: Login — Split Screen

**Arquivos:**
- Modify: `src/app/(auth)/login/page.tsx`

- [ ] **Step 1: Substituir o conteúdo de `login/page.tsx`**

```tsx
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { LoginButton } from "@/components/auth/login-button"

export default async function LoginPage() {
  const session = await getServerSession(authOptions)
  if (session) redirect("/dashboard")

  return (
    <main className="min-h-screen flex flex-col sm:flex-row">
      {/* Painel esquerdo — roxo */}
      <div className="relative flex flex-col justify-end sm:w-1/2 min-h-[200px] sm:min-h-screen bg-gradient-to-br from-violet-950 via-violet-800 to-purple-700 p-8 sm:p-12 overflow-hidden">
        <div className="absolute top-[-80px] right-[-80px] w-[300px] h-[300px] rounded-full bg-white/5" />
        <div className="absolute bottom-[-60px] left-[-60px] w-[220px] h-[220px] rounded-full bg-white/[0.04]" />
        <div className="absolute top-1/2 left-1/4 w-[100px] h-[100px] rounded-full bg-white/[0.03]" />
        <div className="relative z-10">
          <div className="font-mono text-sm text-white/40 mb-4">$ bridgedev init</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-2">
            Prove sua prontidão técnica
          </h1>
          <p className="text-white/60 text-sm">Desafios reais. Avaliação real.</p>
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex flex-1 items-center justify-center bg-white dark:bg-zinc-950 p-8">
        <div className="flex flex-col items-center gap-6 text-center w-full max-w-sm">
          <div>
            <span className="font-bold text-2xl gradient-text">BridgeDev</span>
            <p className="text-zinc-500 text-sm mt-2 leading-relaxed">
              Simule o dia a dia de um desenvolvedor e comprove sua prontidão técnica.
            </p>
          </div>
          <LoginButton />
          <p className="text-xs text-zinc-400">
            Precisamos de acesso ao GitHub para provisionar seu ambiente de desafio.
          </p>
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Esperado: sem output (zero erros).

- [ ] **Step 3: Commit**

```bash
git add src/app/\(auth\)/login/page.tsx
git commit -m "feat: redesign login com split screen roxo"
```

---

## Task 2: Dashboard — Banner + Cards Elevados

**Arquivos:**
- Modify: `src/app/(dashboard)/dashboard/page.tsx`

- [ ] **Step 1: Substituir o conteúdo de `dashboard/page.tsx`**

```tsx
import { getRequiredSession } from "@/lib/session"
import { db } from "@/lib/db"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const STATUS_STYLES: Record<string, string> = {
  PROVISIONING: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  READY:        "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
  IN_PROGRESS:  "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  SUBMITTED:    "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  EVALUATED:    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  FAILED:       "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
}

const STATUS_LABELS: Record<string, string> = {
  PROVISIONING: "Provisionando",
  READY:        "Pronto",
  IN_PROGRESS:  "Em andamento",
  SUBMITTED:    "Submetido",
  EVALUATED:    "Avaliado",
  FAILED:       "Falhou",
}

export default async function DashboardPage() {
  const session = await getRequiredSession()

  const sandboxes = await db.sandbox.findMany({
    where: { userId: session.user.id },
    include: { challenge: true, report: true },
    orderBy: { startedAt: "desc" },
  })

  const completed = sandboxes.filter((s) => s.status === "EVALUATED").length
  const firstName = session.user.name?.split(" ")[0]

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-xl bg-gradient-to-br from-violet-950 via-violet-800 to-purple-700 p-6">
        <h1 className="text-2xl font-bold text-white">Olá, {firstName}</h1>
        <p className="text-white/70 text-sm mt-1">
          {sandboxes.length === 0
            ? "Você ainda não iniciou nenhum desafio."
            : `${completed} desafio${completed !== 1 ? "s" : ""} concluído${completed !== 1 ? "s" : ""}`}
        </p>
      </div>

      {sandboxes.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800 rounded-xl">
          <p className="text-zinc-500 dark:text-zinc-400 mb-4">Comece seu primeiro desafio agora</p>
          <Button asChild variant="outline" className="border-violet-300 dark:border-violet-800 text-violet-700 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950 hover:border-violet-400">
            <Link href="/challenges">Ver desafios disponíveis</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {sandboxes.map((sandbox) => (
            <div
              key={sandbox.id}
              className="flex items-center justify-between bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md border border-zinc-100 dark:border-zinc-800 rounded-xl p-4 transition-shadow duration-200"
            >
              <div>
                <p className="font-medium text-sm">{sandbox.challenge.title}</p>
                <span className={`inline-block text-xs px-2 py-0.5 rounded font-medium mt-1 ${STATUS_STYLES[sandbox.status] ?? STATUS_STYLES.PROVISIONING}`}>
                  {STATUS_LABELS[sandbox.status] ?? sandbox.status}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {sandbox.report && (
                  <span className={`text-sm font-bold tabular-nums ${
                    sandbox.report.scoreTotal >= 80
                      ? "text-emerald-600 dark:text-emerald-400"
                      : sandbox.report.scoreTotal >= 60
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-red-600 dark:text-red-400"
                  }`}>
                    {sandbox.report.scoreTotal.toFixed(1)} pts
                  </span>
                )}
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className={
                    sandbox.status === "EVALUATED"
                      ? "border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 hover:border-blue-400"
                      : "border-violet-300 dark:border-violet-800 text-violet-700 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950 hover:border-violet-400"
                  }
                >
                  <Link href={sandbox.status === "EVALUATED" ? `/reports/${sandbox.id}` : `/sandbox/${sandbox.id}`}>
                    {sandbox.status === "EVALUATED" ? "Ver Relatório" : "Continuar"}
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Esperado: sem output.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(dashboard\)/dashboard/page.tsx
git commit -m "feat: banner roxo e cards elevados no dashboard"
```

---

## Task 3: Catálogo de Desafios — Banner + Cards com Glow

**Arquivos:**
- Modify: `src/app/(dashboard)/challenges/page.tsx`

- [ ] **Step 1: Substituir o conteúdo de `challenges/page.tsx`**

```tsx
import { db } from "@/lib/db"
import { getRequiredSession } from "@/lib/session"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS, TECH_COLORS, DEFAULT_TECH } from "@/lib/challenge-colors"

export default async function ChallengesPage() {
  const session = await getRequiredSession()

  const [challenges, userSandboxes] = await Promise.all([
    db.challenge.findMany({
      where: { isActive: true },
      orderBy: { difficulty: "asc" },
    }),
    db.sandbox.findMany({
      where: { userId: session.user.id },
      select: { challengeId: true, id: true, status: true },
    }),
  ])

  const sandboxByChallenge = Object.fromEntries(
    userSandboxes.map((s) => [s.challengeId, s])
  )

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-xl bg-gradient-to-br from-violet-950 via-violet-800 to-purple-700 p-6">
        <h1 className="text-2xl font-bold text-white">Desafios</h1>
        <p className="text-white/70 text-sm mt-1">Escolha um ambiente para testar sua prontidão técnica</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {challenges.map((challenge) => {
          const sandbox = sandboxByChallenge[challenge.id]

          return (
            <div
              key={challenge.id}
              className="bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md border border-zinc-100 dark:border-zinc-800 rounded-xl p-5 flex flex-col gap-4 hover:border-violet-200 dark:hover:border-violet-800 transition-all duration-200"
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <h2 className="font-semibold text-sm">{challenge.title}</h2>
                  <span className={`text-xs border rounded px-2 py-0.5 shrink-0 font-medium ${DIFFICULTY_COLORS[challenge.difficulty]}`}>
                    {DIFFICULTY_LABELS[challenge.difficulty]}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 line-clamp-3">
                  {challenge.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-1">
                {challenge.stack.map((s) => (
                  <span
                    key={s}
                    className={`text-xs px-2 py-0.5 rounded font-medium ${TECH_COLORS[s] ?? DEFAULT_TECH}`}
                  >
                    {s}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs text-zinc-400">{challenge.estimatedMinutes}min</span>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="border-violet-300 dark:border-violet-800 text-violet-700 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950 hover:border-violet-400"
                >
                  <Link href={sandbox ? `/sandbox/${sandbox.id}` : `/challenges/${challenge.slug}`}>
                    {sandbox ? "Continuar" : "Iniciar desafio"}
                  </Link>
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Esperado: sem output.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(dashboard\)/challenges/page.tsx
git commit -m "feat: banner roxo e cards elevados no catálogo de desafios"
```

---

## Task 4: Detalhe do Desafio — Banner com Badges + Card Instruções

**Arquivos:**
- Modify: `src/app/(dashboard)/challenges/[slug]/page.tsx`

- [ ] **Step 1: Substituir o conteúdo de `challenges/[slug]/page.tsx`**

```tsx
import { db } from "@/lib/db"
import { getRequiredSession } from "@/lib/session"
import { notFound } from "next/navigation"
import { StartChallengeButton } from "@/components/challenges/start-challenge-button"
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS, TECH_COLORS, DEFAULT_TECH } from "@/lib/challenge-colors"

export default async function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const session = await getRequiredSession()
  const { slug } = await params

  const challenge = await db.challenge.findUnique({
    where: { slug, isActive: true },
  })
  if (!challenge) notFound()

  const existingSandbox = await db.sandbox.findUnique({
    where: {
      userId_challengeId: {
        userId: session.user.id,
        challengeId: challenge.id,
      },
    },
  })

  return (
    <div className="max-w-2xl space-y-6">
      {/* Banner */}
      <div className="rounded-xl bg-gradient-to-br from-violet-950 via-violet-800 to-purple-700 p-6">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-white">{challenge.title}</h1>
          <span className={`text-xs px-2 py-0.5 rounded font-medium ${DIFFICULTY_COLORS[challenge.difficulty]}`}>
            {DIFFICULTY_LABELS[challenge.difficulty]}
          </span>
        </div>
        <p className="text-white/70 text-sm">{challenge.estimatedMinutes} minutos estimados</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {challenge.stack.map((s) => (
          <span
            key={s}
            className={`text-xs px-2 py-0.5 rounded font-medium ${TECH_COLORS[s] ?? DEFAULT_TECH}`}
          >
            {s}
          </span>
        ))}
      </div>

      <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{challenge.description}</p>

      <div className="bg-white dark:bg-zinc-900 shadow-sm border border-violet-100 dark:border-violet-900 rounded-xl p-5">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-3">
          Instruções
        </h2>
        <pre className="text-sm whitespace-pre-wrap text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">
          {challenge.instructions}
        </pre>
      </div>

      <StartChallengeButton
        challengeId={challenge.id}
        existingSandboxId={existingSandbox?.id}
      />
    </div>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Esperado: sem output.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(dashboard)/challenges/[slug]/page.tsx"
git commit -m "feat: banner roxo e card de instruções elevado no detalhe do desafio"
```

---

## Task 5: Sandbox View — Banner com Status Animado + Cards

**Arquivos:**
- Modify: `src/components/sandbox/sandbox-view.tsx`

- [ ] **Step 1: Substituir o conteúdo de `sandbox-view.tsx`**

```tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { SandboxFull } from "@/types"
import { Button } from "@/components/ui/button"

const STATUS_LABELS: Record<string, string> = {
  PROVISIONING: "Preparando seu ambiente...",
  READY: "Ambiente pronto — abra o Codespace para começar",
  IN_PROGRESS: "Em andamento",
  SUBMITTED: "Submetido — calculando pontuação...",
  EVALUATED: "Avaliado",
  FAILED: "Falha no provisionamento — entre em contato com o suporte",
}

export function SandboxView({ sandbox: initial }: { sandbox: SandboxFull }) {
  const [sandbox, setSandbox] = useState(initial)
  const router = useRouter()

  const polling =
    sandbox.status === "PROVISIONING" || sandbox.status === "SUBMITTED"

  useEffect(() => {
    if (!polling) return
    const interval = setInterval(async () => {
      const res = await fetch(`/api/sandbox/${sandbox.id}`)
      if (res.ok) {
        const updated = await res.json() as SandboxFull
        setSandbox(updated)
        if (updated.status === "EVALUATED") router.refresh()
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [polling, sandbox.id, router])

  async function handleSubmit() {
    const res = await fetch(`/api/sandbox/${sandbox.id}/submit`, { method: "POST" })
    if (res.ok) setSandbox((s) => ({ ...s, status: "SUBMITTED", report: null }))
  }

  async function handleReset() {
    if (!confirm("Resetar o desafio apaga todo o progresso. Continuar?")) return
    const res = await fetch(`/api/sandbox/${sandbox.id}`, { method: "DELETE" })
    if (res.ok) router.push(`/challenges/${sandbox.challenge.slug}`)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Banner */}
      <div className="rounded-xl bg-gradient-to-br from-violet-950 via-violet-800 to-purple-700 p-6">
        <h1 className="text-2xl font-bold text-white">{sandbox.challenge.title}</h1>
        <p className={`text-sm mt-1 ${polling ? "text-white/50 animate-pulse" : "text-white/70"}`}>
          {STATUS_LABELS[sandbox.status] ?? sandbox.status}
        </p>
      </div>

      {sandbox.codespaceUrl && (
        <div className="bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800 rounded-xl p-5 flex flex-wrap gap-3">
          <Button asChild variant="outline" className="border-violet-300 dark:border-violet-800 text-violet-700 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950 hover:border-violet-400">
            <a href={sandbox.codespaceUrl} target="_blank" rel="noopener noreferrer">
              Abrir Codespace
            </a>
          </Button>
          {(sandbox.status === "READY" || sandbox.status === "IN_PROGRESS") && (
            <Button variant="outline" onClick={handleSubmit} className="border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:border-emerald-400">
              Submeter Desafio
            </Button>
          )}
          {sandbox.status === "EVALUATED" && (
            <Button variant="outline" onClick={handleSubmit} className="border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950 hover:border-amber-400">
              Re-submeter
            </Button>
          )}
        </div>
      )}

      {sandbox.status === "EVALUATED" && sandbox.report && (
        <Button asChild variant="outline" className="border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 hover:border-blue-400">
          <a href={`/reports/${sandbox.id}`}>Ver Relatório de Prontidão</a>
        </Button>
      )}

      {sandbox.status === "PROVISIONING" && (
        <div className="bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800 rounded-xl p-4 text-sm text-zinc-500 dark:text-zinc-400 space-y-1">
          <p>Criando fork do repositório do desafio...</p>
          <p>Isso leva cerca de 30–60 segundos.</p>
        </div>
      )}

      {sandbox.challenge.instructions && (
        <div className="bg-white dark:bg-zinc-900 shadow-sm border border-violet-100 dark:border-violet-900 rounded-xl p-5">
          <h2 className="font-semibold mb-3 text-sm uppercase tracking-wide text-zinc-500">
            Instruções
          </h2>
          <pre className="text-sm whitespace-pre-wrap text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {sandbox.challenge.instructions}
          </pre>
        </div>
      )}

      <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <Button variant="outline" onClick={handleReset} className="border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-400">
          Resetar Desafio
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Esperado: sem output.

- [ ] **Step 3: Commit**

```bash
git add src/components/sandbox/sandbox-view.tsx
git commit -m "feat: banner roxo com status animado e cards elevados no sandbox"
```

---

## Task 6: Report View — Banner no Header + Card Score Elevado

**Arquivos:**
- Modify: `src/components/report/report-view.tsx`

- [ ] **Step 1: Substituir o conteúdo de `report-view.tsx`**

```tsx
import type { ReadinessReport, Sandbox, Challenge } from "@prisma/client"
import type { ReportFeedback } from "@/types"
import { ScoreGauge } from "./score-gauge"
import { DimensionCard } from "./dimension-card"
import { Button } from "@/components/ui/button"

type ReportWithDeps = ReadinessReport & {
  sandbox: Sandbox & { challenge: Challenge }
}

const DIMENSION_LABELS: Record<string, string> = {
  git: "Git & Versionamento",
  tests: "Cobertura de Testes",
  codeQuality: "Qualidade de Código",
  docs: "Documentação",
  delivery: "Entrega no Prazo",
}

export function ReportView({ report }: { report: ReportWithDeps }) {
  const feedback = report.feedback as unknown as ReportFeedback[]
  const issuedAt = new Date(report.createdAt).toLocaleDateString("pt-BR")

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Banner */}
      <div className="rounded-xl bg-gradient-to-br from-violet-950 via-violet-800 to-purple-700 p-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Relatório de Prontidão</h1>
          <p className="text-white/70 text-sm mt-1">
            {report.sandbox.challenge.title} · Emitido em {issuedAt}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 shrink-0">
          <a href={`/api/reports/${report.sandboxId}/pdf`} download>
            Baixar PDF
          </a>
        </Button>
      </div>

      <div className="bg-white dark:bg-zinc-900 shadow-md border border-violet-100 dark:border-violet-900 rounded-xl p-6 flex items-center gap-6">
        <ScoreGauge score={report.scoreTotal} />
        <div>
          <p className={`text-5xl font-bold ${
            report.scoreTotal >= 80 ? "text-emerald-600 dark:text-emerald-400"
            : report.scoreTotal >= 60 ? "text-amber-600 dark:text-amber-400"
            : "text-red-600 dark:text-red-400"
          }`}>
            {report.scoreTotal.toFixed(1)}
          </p>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">de 100 pontos</p>
          {report.certified ? (
            <span className="inline-block mt-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 text-xs px-3 py-1 rounded-full font-medium">
              Certificado de Prontidão Emitido
            </span>
          ) : (
            <span className="inline-block mt-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs px-3 py-1 rounded-full">
              Mínimo para certificado: 70 pontos
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {feedback.map((f) => (
          <DimensionCard
            key={f.dimension}
            label={DIMENSION_LABELS[f.dimension] ?? f.dimension}
            score={f.score}
            points={f.points}
            improvements={f.improvements}
          />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Esperado: sem output.

- [ ] **Step 3: Commit**

```bash
git add src/components/report/report-view.tsx
git commit -m "feat: banner roxo no relatório e card de score elevado"
```

---

## Verificação Final

- [ ] **Rodar lint**

```bash
pnpm lint
```

Esperado: `✔ 0 problems`.

- [ ] **Rodar TypeScript completo**

```bash
npx tsc --noEmit
```

Esperado: sem output.
