"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface Props {
  challengeId: string
  existingSandboxId?: string
}

export function StartChallengeButton({ challengeId, existingSandboxId }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  if (existingSandboxId) {
    return (
      <Button
        variant="outline"
        size="lg"
        onClick={() => router.push(`/sandbox/${existingSandboxId}`)}
        className="border-violet-300 dark:border-violet-800 text-violet-700 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950 hover:border-violet-400"
      >
        Continuar Desafio
      </Button>
    )
  }

  async function handleStart() {
    setLoading(true)
    const res = await fetch("/api/sandbox/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challengeId }),
    })

    if (res.ok) {
      const data = await res.json() as { sandboxId: string }
      router.push(`/sandbox/${data.sandboxId}`)
    } else {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={handleStart}
      disabled={loading}
      className="border-violet-300 dark:border-violet-800 text-violet-700 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950 hover:border-violet-400"
    >
      {loading ? "Preparando ambiente..." : "Iniciar Desafio"}
    </Button>
  )
}
