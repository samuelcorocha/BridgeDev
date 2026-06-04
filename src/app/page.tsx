import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/layout/theme-toggle"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 hero-bg">
      <header className="flex items-center justify-between px-8 py-4 border-b border-zinc-200/60 dark:border-zinc-800/60 backdrop-blur-sm sticky top-0 z-10 bg-white/80 dark:bg-zinc-950/80">
        <span className="font-bold text-lg gradient-text">BridgeDev</span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild size="sm" variant="outline" className="border-violet-300 dark:border-violet-800 text-violet-700 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950 hover:border-violet-400">
            <Link href="/login">Entrar</Link>
          </Button>
        </div>
      </header>

      <section className="flex flex-col items-center justify-center text-center py-36 px-4 relative">
        {/* Decorative ring */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" aria-hidden>
          <div className="w-[600px] h-[600px] rounded-full border border-violet-200/30 dark:border-violet-800/20" />
          <div className="absolute w-[400px] h-[400px] rounded-full border border-violet-300/20 dark:border-violet-700/20" />
        </div>

        <span className="relative text-xs font-semibold bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-400 px-4 py-1.5 rounded-full mb-8 border border-violet-200 dark:border-violet-900 violet-glow-sm">
          Plataforma de Prontidão Técnica
        </span>

        <h1 className="relative text-5xl sm:text-6xl font-bold tracking-tight max-w-2xl leading-[1.1]">
          Da faculdade para o mercado,{" "}
          <span className="gradient-text">sem fingir que é fácil</span>
        </h1>

        <p className="relative mt-8 text-lg text-zinc-500 dark:text-zinc-400 max-w-xl leading-relaxed">
          O BridgeDev simula o dia a dia de um desenvolvedor júnior: código legado,
          CI/CD, Git e prazos reais. Complete desafios e receba um{" "}
          <strong className="text-zinc-700 dark:text-zinc-200">Relatório de Prontidão</strong>{" "}
          para mostrar aos recrutadores.
        </p>

        <div className="relative mt-10 flex gap-4">
          <Button
            asChild
            size="lg"
            className="bg-violet-600 hover:bg-violet-700 dark:hover:bg-violet-500 text-white violet-glow transition-all duration-200 hover:scale-[1.02]"
          >
            <Link href="/login">Começar agora</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-violet-300 dark:border-violet-800 text-violet-700 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950 hover:border-violet-400 transition-all duration-200"
          >
            <Link href="/challenges">Ver desafios</Link>
          </Button>
        </div>
      </section>

      <section className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto px-4 pb-28">
        {[
          {
            title: "Sandbox Corporativo",
            body: "Ambiente pré-configurado via GitHub Codespaces. Você resolve o problema, não configura a máquina.",
            accent: "from-violet-500 to-purple-600",
          },
          {
            title: "Avaliação Real",
            body: "Analisamos seus commits, testes, lint e documentação — não só se o código funciona.",
            accent: "from-purple-500 to-fuchsia-600",
          },
          {
            title: "Relatório para Recrutadores",
            body: "Exporte um PDF com sua pontuação por dimensão e prove sua autonomia técnica.",
            accent: "from-fuchsia-500 to-pink-600",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="group relative border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 bg-white dark:bg-zinc-900 hover:border-violet-300 dark:hover:border-violet-700 transition-all duration-300 hover:violet-glow-sm overflow-hidden"
          >
            {/* Top accent bar */}
            <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${f.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-100">{f.title}</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{f.body}</p>
          </div>
        ))}
      </section>

      <footer className="text-center pb-8 text-xs text-zinc-400 dark:text-zinc-600">
        © 2025 BridgeDev — Plataforma de Prontidão Técnica
      </footer>
    </main>
  )
}
