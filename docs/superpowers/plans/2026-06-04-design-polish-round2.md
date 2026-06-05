# Design Polish Round 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refinar visualmente o relatório (score card horizontal + mini-barras), cards de desafio (faixa de cor + blocos de dificuldade), sidebar (avatar + plano) e estados vazios/loading (ícone motivacional + steps animados).

**Architecture:** Seis arquivos modificados independentemente — sem novos componentes, sem mudanças de lógica. `ScoreGauge` recebe prop `size` para ser reutilizável em tamanhos diferentes. Constantes locais de cor para dificuldade ficam em `challenges/page.tsx` onde são usadas.

**Tech Stack:** Next.js 14 App Router, Tailwind CSS, TypeScript strict, shadcn/ui Button, Lucide icons.

---

## Arquivos a modificar

| Arquivo | O que muda |
|---|---|
| `src/components/report/score-gauge.tsx` | Prop `size?: number` para SVG redimensionável |
| `src/components/report/dimension-card.tsx` | Barra de progresso colorida por score |
| `src/components/report/report-view.tsx` | Score card horizontal com gauge menor + mini-barras das 5 dimensões |
| `src/app/(dashboard)/challenges/page.tsx` | Faixa de cor no topo + blocos de dificuldade no rodapé (remove badge texto) |
| `src/components/layout/sidebar.tsx` | Avatar com iniciais + badge de plano |
| `src/app/(dashboard)/dashboard/page.tsx` | Empty state com ícone + copy motivacional |
| `src/components/sandbox/sandbox-view.tsx` | Loading steps (3 passos animados) no provisionamento |

---

## Task 1: ScoreGauge — prop `size`

**Arquivos:**
- Modify: `src/components/report/score-gauge.tsx`

- [ ] **Step 1: Substituir conteúdo de `score-gauge.tsx`**

```tsx
interface Props {
  score: number
  size?: number
}

export function ScoreGauge({ score, size = 120 }: Props) {
  const radius = 50
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  const color =
    score >= 80 ? "#10b981" : score >= 60 ? "#ca8a04" : "#dc2626"

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-label={`Score: ${score}`}>
      <circle
        cx="60"
        cy="60"
        r={radius}
        fill="none"
        stroke="currentColor"
        className="text-zinc-200 dark:text-zinc-700"
        strokeWidth="10"
      />
      <circle
        cx="60"
        cy="60"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeDasharray={`${progress} ${circumference}`}
        strokeLinecap="round"
        transform="rotate(-90 60 60)"
      />
    </svg>
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
git add src/components/report/score-gauge.tsx
git commit -m "feat: adiciona prop size ao ScoreGauge"
```

---

## Task 2: DimensionCard — barra de progresso

**Arquivos:**
- Modify: `src/components/report/dimension-card.tsx`

- [ ] **Step 1: Substituir conteúdo de `dimension-card.tsx`**

```tsx
import { CheckCircle, AlertCircle } from "lucide-react"

interface Props {
  label: string
  score: number
  points: string[]
  improvements: string[]
}

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400"
  if (score >= 60) return "text-amber-600 dark:text-amber-400"
  return "text-red-600 dark:text-red-400"
}

function barColor(score: number) {
  if (score >= 80) return "bg-emerald-500"
  if (score >= 60) return "bg-amber-500"
  return "bg-red-500"
}

export function DimensionCard({ label, score, points, improvements }: Props) {
  return (
    <div className="bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800 rounded-xl p-4 space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-sm">{label}</h3>
        <span className={`font-bold text-lg ${scoreColor(score)}`}>{score.toFixed(0)}</span>
      </div>

      <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>

      {points.length > 0 && (
        <ul className="space-y-1">
          {points.map((p, i) => (
            <li key={i} className="flex gap-2 text-xs text-emerald-700 dark:text-emerald-400">
              <CheckCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              {p}
            </li>
          ))}
        </ul>
      )}

      {improvements.length > 0 && (
        <ul className="space-y-1">
          {improvements.map((p, i) => (
            <li key={i} className="flex gap-2 text-xs text-amber-700 dark:text-amber-400">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              {p}
            </li>
          ))}
        </ul>
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
git add src/components/report/dimension-card.tsx
git commit -m "feat: barra de progresso colorida no DimensionCard"
```

---

## Task 3: ReportView — score card horizontal com mini-barras

**Arquivos:**
- Modify: `src/components/report/report-view.tsx`

- [ ] **Step 1: Substituir conteúdo de `report-view.tsx`**

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

const DIMENSION_SHORT: Record<string, string> = {
  git: "Git",
  tests: "Testes",
  codeQuality: "Código",
  docs: "Docs",
  delivery: "Entrega",
}

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400"
  if (score >= 60) return "text-amber-600 dark:text-amber-400"
  return "text-red-600 dark:text-red-400"
}

function barColor(score: number) {
  if (score >= 80) return "bg-emerald-500"
  if (score >= 60) return "bg-amber-500"
  return "bg-red-500"
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

      {/* Score card horizontal */}
      <div className="bg-white dark:bg-zinc-900 shadow-md border border-violet-100 dark:border-violet-900 rounded-xl p-6 flex items-center gap-6">
        <ScoreGauge score={report.scoreTotal} size={80} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <p className={`text-4xl font-black ${scoreColor(report.scoreTotal)}`}>
              {report.scoreTotal.toFixed(1)}
            </p>
            <p className="text-zinc-400 dark:text-zinc-500 text-sm">/ 100 pts</p>
            {report.certified ? (
              <span className="ml-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-medium">
                ✓ Certificado
              </span>
            ) : (
              <span className="ml-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-xs px-2.5 py-0.5 rounded-full">
                Mín. 70 pts
              </span>
            )}
          </div>
          {/* Mini-barras das 5 dimensões */}
          <div className="flex flex-col gap-1.5 mt-3">
            {feedback.map((f) => (
              <div key={f.dimension} className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 dark:text-zinc-500 w-14 shrink-0">
                  {DIMENSION_SHORT[f.dimension] ?? f.dimension}
                </span>
                <div className="flex-1 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${barColor(f.score)}`}
                    style={{ width: `${f.score}%` }}
                  />
                </div>
                <span className={`text-xs font-medium w-6 text-right ${scoreColor(f.score)}`}>
                  {f.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DimensionCards detalhados */}
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
git commit -m "feat: score card horizontal com mini-barras das dimensões no relatório"
```

---

## Task 4: Cards de Desafio — faixa de cor + blocos de dificuldade

**Arquivos:**
- Modify: `src/app/(dashboard)/challenges/page.tsx`

- [ ] **Step 1: Substituir conteúdo de `challenges/page.tsx`**

```tsx
import { db } from "@/lib/db"
import { getRequiredSession } from "@/lib/session"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TECH_COLORS, DEFAULT_TECH } from "@/lib/challenge-colors"

const DIFFICULTY_BAR_COLORS: Record<string, string> = {
  BEGINNER: "from-emerald-400 to-emerald-500",
  INTERMEDIATE: "from-amber-400 to-amber-500",
  ADVANCED: "from-red-400 to-red-500",
}

const DIFFICULTY_BLOCK_COLORS: Record<string, string> = {
  BEGINNER: "bg-emerald-500",
  INTERMEDIATE: "bg-amber-500",
  ADVANCED: "bg-red-500",
}

const DIFFICULTY_FILLED_BLOCKS: Record<string, number> = {
  BEGINNER: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3,
}

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
          const filledBlocks = DIFFICULTY_FILLED_BLOCKS[challenge.difficulty] ?? 1

          return (
            <div
              key={challenge.id}
              className="relative bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden flex flex-col gap-4 p-5 pt-6 hover:border-violet-200 dark:hover:border-violet-800 transition-all duration-200"
            >
              {/* Faixa de cor no topo por dificuldade */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${DIFFICULTY_BAR_COLORS[challenge.difficulty] ?? "from-zinc-300 to-zinc-400"}`} />

              <div>
                <h2 className="font-semibold text-sm mb-2">{challenge.title}</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3">
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
                {/* Blocos de dificuldade + tempo */}
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className={`w-3 h-1.5 rounded-sm ${
                          i < filledBlocks
                            ? (DIFFICULTY_BLOCK_COLORS[challenge.difficulty] ?? "bg-zinc-400")
                            : "bg-zinc-200 dark:bg-zinc-700"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-zinc-400">{challenge.estimatedMinutes}min</span>
                </div>
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
git commit -m "feat: faixa de cor e blocos de dificuldade nos cards de desafio"
```

---

## Task 5: Sidebar — avatar com iniciais + badge de plano

**Arquivos:**
- Modify: `src/components/layout/sidebar.tsx`

- [ ] **Step 1: Substituir conteúdo de `sidebar.tsx`**

```tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Boxes } from "lucide-react"
import type { DefaultSession } from "next-auth"
import { SignOutButton } from "./sign-out-button"
import { ThemeToggle } from "./theme-toggle"

interface Props {
  user: DefaultSession["user"] & { id: string; plan: string }
}

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Início" },
  { href: "/challenges", icon: Boxes, label: "Desafios" },
]

export function Sidebar({ user }: Props) {
  const pathname = usePathname()

  const firstName = user.name?.split(" ")[0] ?? "Usuário"
  const initials =
    user.name
      ?.split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() ?? "?"
  const planLabel = user.plan === "B2B" ? "Empresa" : "Estudante"

  return (
    <aside className="w-56 border-r border-zinc-200 dark:border-zinc-800 flex flex-col py-6 px-3 bg-white dark:bg-zinc-950">
      <div className="px-3 mb-8">
        <span className="font-bold text-lg tracking-tight gradient-text">BridgeDev</span>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                active
                  ? "bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-400 font-medium"
                  : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <item.icon className={`h-4 w-4 ${active ? "text-violet-600 dark:text-violet-400" : ""}`} />
              {item.label}
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-500 dark:bg-violet-400" />
              )}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 px-3 space-y-2">
        <ThemeToggle />
        {/* Avatar + nome + plano */}
        <div className="flex items-center gap-2 px-3 py-1">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-zinc-300 truncate font-medium">{firstName}</p>
            <p className="text-[10px] text-violet-400 font-medium">{planLabel}</p>
          </div>
        </div>
        <SignOutButton />
      </div>
    </aside>
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
git add src/components/layout/sidebar.tsx
git commit -m "feat: avatar com iniciais e badge de plano na sidebar"
```

---

## Task 6: Dashboard — empty state com ícone motivacional

**Arquivos:**
- Modify: `src/app/(dashboard)/dashboard/page.tsx`

- [ ] **Step 1: Localizar e substituir apenas o bloco do empty state**

Encontrar este bloco no arquivo (dentro do `sandboxes.length === 0 ? (...)`):

```tsx
        <div className="text-center py-16 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md border border-zinc-100 dark:border-zinc-800 rounded-xl transition-shadow duration-200">
          <p className="text-zinc-500 dark:text-zinc-400 mb-4">Comece seu primeiro desafio agora</p>
          <Button asChild variant="outline" className="border-violet-300 dark:border-violet-800 text-violet-700 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950 hover:border-violet-400">
            <Link href="/challenges">Ver desafios disponíveis</Link>
          </Button>
        </div>
```

Substituir por:

```tsx
        <div className="text-center py-16 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md border border-zinc-100 dark:border-zinc-800 rounded-xl transition-shadow duration-200">
          <div className="text-4xl mb-3">🚀</div>
          <p className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
            Seu primeiro desafio te espera
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-5 max-w-xs mx-auto">
            Simule o dia a dia de um dev júnior e receba seu Relatório de Prontidão.
          </p>
          <Button asChild>
            <Link href="/challenges">Ver desafios disponíveis</Link>
          </Button>
        </div>
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Esperado: sem output.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(dashboard\)/dashboard/page.tsx
git commit -m "feat: empty state motivacional com ícone no dashboard"
```

---

## Task 7: Sandbox — loading steps animados

**Arquivos:**
- Modify: `src/components/sandbox/sandbox-view.tsx`

- [ ] **Step 1: Localizar e substituir o bloco de provisionamento**

Encontrar este bloco no return do componente:

```tsx
      {sandbox.status === "PROVISIONING" && (
        <div className="bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800 rounded-xl p-4 text-sm text-zinc-500 dark:text-zinc-400 space-y-1">
          <p>Criando fork do repositório do desafio...</p>
          <p>Isso leva cerca de 30–60 segundos.</p>
        </div>
      )}
```

Substituir por:

```tsx
      {sandbox.status === "PROVISIONING" && (
        <div className="bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800 rounded-xl p-5">
          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-4">
            Preparando seu ambiente
          </p>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center shrink-0">
                <span className="text-emerald-600 dark:text-emerald-400 text-xs">✓</span>
              </div>
              <span className="text-sm text-zinc-400 dark:text-zinc-500 line-through">
                Criando fork do repositório
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-violet-500 border-t-transparent animate-spin shrink-0" />
              <span className="text-sm text-violet-600 dark:text-violet-400 font-medium">
                Configurando webhook...
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-zinc-200 dark:border-zinc-700 shrink-0" />
              <span className="text-sm text-zinc-400 dark:text-zinc-500">
                Pronto para começar
              </span>
            </div>
          </div>
          <p className="text-xs text-zinc-400 mt-4">Isso leva cerca de 30–60 segundos.</p>
        </div>
      )}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Esperado: sem output.

- [ ] **Step 3: Commit**

```bash
git add src/components/sandbox/sandbox-view.tsx
git commit -m "feat: loading steps animados no provisionamento do sandbox"
```

---

## Verificação Final

- [ ] **TypeScript limpo**

```bash
npx tsc --noEmit
```

Esperado: sem output.

- [ ] **ESLint limpo**

```bash
pnpm lint
```

Esperado: `0 problems`.
