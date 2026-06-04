import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { inngest } from "@/lib/inngest"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { id } = await params

  const sandbox = await db.sandbox.findUnique({
    where: { id, userId: session.user.id },
  })

  if (!sandbox) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
  }

  const allowedStatuses = ["IN_PROGRESS", "READY", "EVALUATED"]
  if (!allowedStatuses.includes(sandbox.status)) {
    return NextResponse.json(
      { error: "Sandbox não pode ser submetido neste estado" },
      { status: 409 }
    )
  }

  await db.sandbox.update({
    where: { id },
    data: { status: "SUBMITTED", submittedAt: new Date() },
  })

  await inngest.send({ name: "sandbox/evaluate", data: { sandboxId: id } })

  return NextResponse.json({ ok: true })
}
