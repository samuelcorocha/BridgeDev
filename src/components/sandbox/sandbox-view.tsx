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
