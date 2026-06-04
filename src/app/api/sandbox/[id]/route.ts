import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(
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
    include: { challenge: true, report: true },
  })

  if (!sandbox) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
  }

  return NextResponse.json(sandbox)
}

export async function DELETE(
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

  await db.sandbox.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
