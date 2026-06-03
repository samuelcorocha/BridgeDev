import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { LoginButton } from "@/components/auth/login-button"

export default async function LoginPage() {
  const session = await getServerSession(authOptions)
  if (session) redirect("/dashboard")

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="flex flex-col items-center gap-6 text-center bg-white border border-zinc-200 rounded-xl p-10 shadow-sm max-w-sm w-full">
        <div>
          <span className="font-bold text-xl">BridgeDev</span>
          <p className="text-zinc-500 text-sm mt-2">
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
