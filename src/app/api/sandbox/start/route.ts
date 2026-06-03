import { NextResponse } from "next/server"
import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { inngest } from "@/lib/inngest"

const schema = z.object({ challengeId: z.string().cuid() })

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "challengeId inválido" }, { status: 400 })
  }

  const { challengeId } = parsed.data

  const challenge = await db.challenge.findUnique({
    where: { id: challengeId, isActive: true },
  })
  if (!challenge) {
    return NextResponse.json({ error: "Desafio não encontrado" }, { status: 404 })
  }

  const existing = await db.sandbox.findUnique({
    where: { userId_challengeId: { userId: session.user.id, challengeId } },
  })
  if (existing) {
    return NextResponse.json({ sandboxId: existing.id }, { status: 200 })
  }

  const sandbox = await db.sandbox.create({
    data: { userId: session.user.id, challengeId, status: "PROVISIONING" },
  })

  await inngest.send({ name: "sandbox/provision", data: { sandboxId: sandbox.id } })

  return NextResponse.json({ sandboxId: sandbox.id }, { status: 201 })
}
