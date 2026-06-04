import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { LoginButton } from "@/components/auth/login-button"

export default async function LoginPage() {
  const session = await getServerSession(authOptions)
  if (session) redirect("/dashboard")

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 hero-bg">
      <div className="flex flex-col items-center gap-6 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-10 shadow-sm max-w-sm w-full relative overflow-hidden violet-glow-sm">
        {/* Top gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />

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
    </main>
  )
}
