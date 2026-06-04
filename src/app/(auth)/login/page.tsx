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
