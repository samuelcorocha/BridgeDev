import { getRequiredSession } from "@/lib/session"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { SandboxView } from "@/components/sandbox/sandbox-view"

export default async function SandboxPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getRequiredSession()
  const { id } = await params

  const sandbox = await db.sandbox.findUnique({
    where: { id, userId: session.user.id },
    include: { challenge: true, report: true },
  })

  if (!sandbox) notFound()

  return <SandboxView sandbox={sandbox} />
}
