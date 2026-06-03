import { getRequiredSession } from "@/lib/session"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { ReportView } from "@/components/report/report-view"

export default async function ReportPage({
  params,
}: {
  params: Promise<{ sandboxId: string }>
}) {
  const session = await getRequiredSession()
  const { sandboxId } = await params

  const report = await db.readinessReport.findUnique({
    where: { sandboxId, userId: session.user.id },
    include: { sandbox: { include: { challenge: true } } },
  })

  if (!report) notFound()

  return <ReportView report={report} />
}
