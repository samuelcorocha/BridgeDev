import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { generateReportPdf } from "@/server/pdf/report-pdf"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sandboxId: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { sandboxId } = await params

  const report = await db.readinessReport.findUnique({
    where: { sandboxId, userId: session.user.id },
    include: { sandbox: { include: { challenge: true } }, user: true },
  })

  if (!report) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
  }

  const pdfBuffer = await generateReportPdf(report)

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="bridgedev-report-${sandboxId}.pdf"`,
    },
  })
}
