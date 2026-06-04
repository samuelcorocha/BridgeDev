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
      <div>
        <h1 className="text-2xl font-bold">{sandbox.challenge.title}</h1>
        <p
          className={`text-sm mt-1 ${
            polling ? "text-zinc-400 animate-pulse" : "text-zinc-500"
          }`}
        >
          {STATUS_LABELS[sandbox.status] ?? sandbox.status}
        </p>
      </div>

      {sandbox.codespaceUrl && (
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <a href={sandbox.codespaceUrl} target="_blank" rel="noopener noreferrer">
              Abrir Codespace
            </a>
          </Button>
          {(sandbox.status === "READY" || sandbox.status === "IN_PROGRESS") && (
            <Button variant="outline" onClick={handleSubmit}>
              Submeter Desafio
            </Button>
          )}
          {sandbox.status === "EVALUATED" && (
            <Button variant="outline" onClick={handleSubmit}>
              Re-submeter
            </Button>
          )}
        </div>
      )}

      {sandbox.status === "EVALUATED" && sandbox.report && (
        <Button asChild>
          <a href={`/reports/${sandbox.id}`}>Ver Relatório de Prontidão</a>
        </Button>
      )}

      <div className="pt-4 border-t border-zinc-200">
        <Button variant="outline" onClick={handleReset} className="text-red-600 hover:text-red-700 hover:border-red-300">
          Resetar Desafio
        </Button>
      </div>

      {sandbox.status === "PROVISIONING" && (
        <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 text-sm text-zinc-500 space-y-1">
          <p>Criando fork do repositório do desafio...</p>
          <p>Isso leva cerca de 30–60 segundos.</p>
        </div>
      )}

      {sandbox.challenge.instructions && (
        <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-5">
          <h2 className="font-semibold mb-3 text-sm uppercase tracking-wide text-zinc-500">
            Instruções
          </h2>
          <pre className="text-sm whitespace-pre-wrap text-zinc-700 leading-relaxed">
            {sandbox.challenge.instructions}
          </pre>
        </div>
      )}
    </div>
  )
}
