import { getRequiredSession } from "@/lib/session"
import { Sidebar } from "@/components/layout/sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getRequiredSession()

  return (
    <div className="flex h-screen bg-violet-50/40 dark:bg-zinc-950">
      <Sidebar user={session.user} />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  )
}
