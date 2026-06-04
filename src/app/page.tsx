import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/layout/theme-toggle"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950">
      <header className="flex items-center justify-between px-8 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <span className="font-bold text-lg text-violet-600 dark:text-violet-400">BridgeDev</span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild size="sm" variant="outline" className="border-violet-300 dark:border-violet-800 text-violet-700 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950 hover:border-violet-400">
            <Link href="/login">Entrar</Link>
          </Button>
        </div>
      </header>

      <section className="flex flex-col items-center justify-center text-center py-32 px-4">
        <span className="text-xs font-medium bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-400 px-3 py-1 rounded-full mb-6">
          Plataforma de Prontidão Técnica
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight max-w-2xl leading-tight">
          Da faculdade para o mercado, sem fingir que é fácil
        </h1>
        <p className="mt-6 text-lg text-zinc-500 dark:text-zinc-400 max-w-xl leading-relaxed">
          O BridgeDev simula o dia a dia de um desenvolvedor júnior: código legado,
          CI/CD, Git e prazos reais. Complete desafios e receba um{" "}
          <strong className="text-zinc-700 dark:text-zinc-200">Relatório de Prontidão</strong> para mostrar aos recrutadores.
        </p>
        <div className="mt-10 flex gap-4">
          <Button asChild size="lg" className="bg-violet-600 hover:bg-violet-700 text-white dark:bg-violet-600 dark:hover:bg-violet-500">
            <Link href="/login">Começar agora</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-violet-300 dark:border-violet-800 text-violet-700 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950 hover:border-violet-400">
            <Link href="/challenges">Ver desafios</Link>
          </Button>
        </div>
      </section>

      <section className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto px-4 pb-24">
        {[
          {
            title: "Sandbox Corporativo",
            body: "Ambiente pré-configurado via GitHub Codespaces. Você resolve o problema, não configura a máquina.",
          },
          {
            title: "Avaliação Real",
            body: "Analisamos seus commits, testes, lint e documentação — não só se o código funciona.",
          },
          {
            title: "Relatório para Recrutadores",
            body: "Exporte um PDF com sua pontuação por dimensão e prove sua autonomia técnica.",
          },
        ].map((f) => (
          <div key={f.title} className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 bg-white dark:bg-zinc-900 border-l-4 border-l-violet-400 dark:border-l-violet-600">
            <h3 className="font-semibold mb-2">{f.title}</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{f.body}</p>
          </div>
        ))}
      </section>
    </main>
  )
}
