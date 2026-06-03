import { NextResponse } from "next/server"
import { createHmac, timingSafeEqual } from "crypto"
import { db } from "@/lib/db"
import { env } from "@/lib/env"

async function verifySignature(req: Request, body: string): Promise<boolean> {
  const sig = req.headers.get("x-hub-signature-256")
  if (!sig) return false
  const expected =
    "sha256=" +
    createHmac("sha256", env.GITHUB_WEBHOOK_SECRET).update(body).digest("hex")
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  } catch {
    return false
  }
}

export async function POST(req: Request) {
  const body = await req.text()

  if (!(await verifySignature(req, body))) {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 })
  }

  const event = req.headers.get("x-github-event") ?? "unknown"
  const payload = JSON.parse(body) as { repository?: { full_name: string } }

  const repoFullName = payload.repository?.full_name ?? ""

  const sandbox = await db.sandbox.findFirst({
    where: {
      forkRepo: repoFullName,
      status: { in: ["READY", "IN_PROGRESS"] },
    },
  })

  if (!sandbox) {
    return NextResponse.json({ ok: true })
  }

  if (event === "push" && sandbox.status === "READY") {
    await db.sandbox.update({
      where: { id: sandbox.id },
      data: { status: "IN_PROGRESS" },
    })
  }

  await db.sandboxEvent.create({
    data: { sandboxId: sandbox.id, type: event, payload },
  })

  return NextResponse.json({ ok: true })
}
