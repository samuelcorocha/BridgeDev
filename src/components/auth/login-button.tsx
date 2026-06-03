"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { GitBranch } from "lucide-react"

export function LoginButton() {
  return (
    <Button
      onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
      size="lg"
    >
      <GitBranch className="h-5 w-5" />
      Entrar com GitHub
    </Button>
  )
}
