import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <header className="flex items-center justify-between px-8 py-4 border-b border-zinc-200">
        <span className="font-bold text-lg">BridgeDev</span>
        <Button asChild size="sm">
          <Link href="/login">Entrar</Link>
        </Button>
      </header>

      <section className="flex flex-col items-center justify-center text-center py-32 px-4">
        <span className="text-xs font-medium bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full mb-6">
          Plataforma de Prontidão Técnica
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight max-w-2xl leading-tight">
          Da faculdade para o mercado, sem fingir que é fácil
        </h1>
        <p className="mt-6 text-lg text-zinc-500 max-w-xl leading-relaxed">
          O BridgeDev simula o dia a dia de um desenvolvedor júnior: código legado,
          CI/CD, Git e prazos reais. Complete desafios e receba um{" "}
          <strong>Relatório de Prontidão</strong> para mostrar aos recrutadores.
        </p>
        <div className="mt-10 flex gap-4">
          <Button asChild size="lg">
            <Link href="/login">Começar agora</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
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
          <div key={f.title} className="border border-zinc-200 rounded-xl p-6">
            <h3 className="font-semibold mb-2">{f.title}</h3>
            <p className="text-sm text-zinc-500">{f.body}</p>
          </div>
        ))}
      </section>
    </main>
  )
}
