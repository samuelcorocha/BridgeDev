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
      <Button onClick={() => router.push(`/sandbox/${existingSandboxId}`)} size="lg">
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
    <Button onClick={handleStart} disabled={loading} size="lg">
      {loading ? "Preparando ambiente..." : "Iniciar Desafio"}
    </Button>
  )
}
